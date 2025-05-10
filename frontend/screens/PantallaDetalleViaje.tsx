import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import { FontAwesome } from "@expo/vector-icons";
import { TextInput } from "react-native";

import BuscarActividadesHoteles from "../components/BuscarActividadesHoteles";
import { LugarGoogle } from "../types/typeGoogle";

import ComentarioPubli from "../components/ComentarioPubli";
import ModalNuevoGasto from "../components/ModalNuevoGasto";



type Props = StackScreenProps<RootStackParamList, "DetalleViaje">;

const PantallaDetalleViaje: React.FC<Props> = ({ navigation, route }) => {
  const [pestana, setPestana] = useState<"descripcion" | "itinerario" | "gastos">("descripcion");
  const [viaje, setViaje] = useState<any>(null);
  const { viajeId } = route.params;
  const [estaPublicado, setEstaPublicado] = useState<boolean>(false);
  const [nuevaNota, setNuevaNota] = useState("");
  const [notas, setNotas] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modoBusqueda, setModoBusqueda] = useState<"actividad" | "hotel" | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

  const [comentario, setComentario] = useState("");
  const [mostrarModalComentario, setMostrarModalComentario] = useState(false);

  const [gastos, setGastos] = useState<any[]>([]);
  const [mostrarModalGasto, setMostrarModalGasto] = useState(false);

  const totalGastado = gastos.reduce((acc, gasto) => acc + gasto.cantidad, 0);
  const [orden, setOrden] = useState<"cantidad" | "fecha">("fecha");




  const cargarDatos = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const respuestaViaje = await api.get(`viajes/${viajeId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setViaje(respuestaViaje.data);
    setNotas(respuestaViaje.data.notas?.split("\n").filter((n: string) => n.trim()) || []);


    const estado = await api.get(`viaje_compartido/${viajeId}/esta_publicado/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEstaPublicado(estado.data.publicado);
  };

  const obtenerGastosViaje = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const res = await api.get(`gastos/?viaje=${viajeId}&ordering=${orden === "cantidad" ? "-cantidad" : "-fecha"}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGastos(res.data);
  };
  
  
  const agregarGasto = async (nuevoGasto: any) => {
    const token = await AsyncStorage.getItem("access_token");
    await api.post("gastos/", { ...nuevoGasto, viaje: viajeId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    obtenerGastosViaje();
  };
  
  const borrarGasto = async (id: number) => {
    const token = await AsyncStorage.getItem("access_token");
    await api.delete(`gastos/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    obtenerGastosViaje();
  };
  
  

  const despublicarViaje = () => {
    Alert.alert(
      "¿Dejar de publicar?",
      "Esto hará que el viaje ya no esté disponible públicamente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Dejar de publicar",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };
            try {
              await api.post(`viaje_compartido/${viajeId}/despublicar/`, {}, { headers });
              cargarDatos();
            } catch (err) {
              Alert.alert("Error", "No se pudo actualizar el estado del viaje.");
            }
          },
        },
      ]
    );
  };
  

  useEffect(() => {
    cargarDatos();
  }, [viajeId]);
  
  useEffect(() => {
    obtenerGastosViaje();
  }, [viajeId, orden]);
  

  const confirmarEliminacion = (tipo: "hotel" | "actividad", id: number) => {
    Alert.alert(
      `¿Eliminar ${tipo}?`,
      "Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarElemento(tipo, id),
        },
      ]
    );
  };


  const manejarSeleccionLugar = async (lugar: LugarGoogle, fechasHotel?: { inicio: string; fin: string }) => {
    const token = await AsyncStorage.getItem("access_token");
    const headers = { Authorization: `Bearer ${token}` };
  
    if (!modoBusqueda || !viaje) return;
  
    if (modoBusqueda === "actividad" && fechaSeleccionada) {
      try {
        await api.post(`viajes/${viajeId}/agregar_actividad/`, {
          nombre: lugar.nombre,
          direccion: lugar.direccion, 
          descripcion: "",
          url_imagen: lugar.foto,
          latitud: lugar.latitud,
          longitud: lugar.longitud,
          fecha_realizacion: fechaSeleccionada,
          place_id: lugar.place_id,
        }, { headers });
  
        cargarDatos();
      }catch (err) {
        if (err.response) {
          console.log("Status:", err.response.status);
          console.log("Headers:", err.response.headers);
          console.log("DATA:", err.response.data);  // Aquí verás el HTML
        } else {
          console.error("Error sin response:", err);
        }
      }
    }
  
    if (modoBusqueda === "hotel" && fechasHotel) {
      try {
        const partesDireccion = lugar.direccion.split(",");
        const paisExtraido = partesDireccion[partesDireccion.length - 1]?.trim() || "Desconocido";
        await api.post(`viajes/${viajeId}/agregar_hotel/`, {
          nombre: lugar.nombre,
          direccion: lugar.direccion, 
          pais: paisExtraido,
          descripcion: "",
          imagen: lugar.foto,
          latitud: lugar.latitud,
          longitud: lugar.longitud,
          fecha_inicio: fechasHotel.inicio,
          fecha_fin: fechasHotel.fin,
          place_id: lugar.place_id,
        }, { headers });
    
        cargarDatos();
      } catch (err) {
        Alert.alert("Error", "No se pudo añadir el hotel");
      }
    }
    
  
    setModalVisible(false);
  };
  

  const guardarNotas = async (notasActualizadas: string[]) => {
    const token = await AsyncStorage.getItem("access_token");
    try {
      await api.patch(`viajes/${viajeId}/`, {
        notas: notasActualizadas.join("\n"),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotas(notasActualizadas);
    } catch (err) {
      Alert.alert("Error", "No se pudieron guardar los recordatorios");
    }
  };
  

  const eliminarElemento = async (tipo: "hotel" | "actividad", id: number) => {
    const token = await AsyncStorage.getItem("access_token");
    try {
      await api.delete(`${tipo === "hotel" ? "hoteles" : "actividades_en_viaje"}/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarDatos();
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar.");
    }
  };

  const renderizarContenido = () => {
    if (pestana === "descripcion") {
      return (
        <View>
          <Text style={estilos.subtitulo}>Mi hotel/hoteles:</Text>
          {viaje?.estancias?.length === 0 ? (
            <Text style={estilos.textoInfo}>No hay hoteles registrados</Text>
          ) : (
            viaje.estancias.map((estancia: any) => (
              <View key={estancia.id} style={estilos.cardHorizontal}>
                <Image source={{ uri: estancia.hotel.imagen }} style={estilos.cardImagen} />
                <View style={{ flex: 1 }}>
                  <Text style={estilos.cardTitulo}>{estancia.hotel.nombre}</Text>
                  <Text style={estilos.cardTexto}>{estancia.hotel.descripcion}</Text>
                  
                  <Text style={estilos.cardTexto}>
                    {new Date(estancia.fecha_inicio).toLocaleDateString()} -{" "}
                    {new Date(estancia.fecha_fin).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
    
          
          <View style={{ padding: 10 }}>
            <TouchableOpacity
              style={{ backgroundColor: "#007AFF", padding: 12, borderRadius: 10 }}
              onPress={() => {
                setModoBusqueda("hotel");
                setFechaSeleccionada(null);
                setModalVisible(true);
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
                Añadir hotel
              </Text>
            </TouchableOpacity>
          </View>
    
          <View style={{ paddingHorizontal: 10, marginTop: 20 }}>
            <Text style={estilos.subtitulo}>Recordatorios:</Text>
    
            {notas.map((nota, index) => (
              <View key={index} style={estilos.cardHorizontal}>
                <Text style={{ flex: 1 }}>{nota}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const nuevas = notas.filter((_, i) => i !== index);
                    guardarNotas(nuevas);
                  }}
                >
                  <FontAwesome name="trash" size={18} color="red" />
                </TouchableOpacity>
              </View>
            ))}
    
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
              <TextInput
                placeholder="Escribe un nuevo recordatorio"
                value={nuevaNota}
                onChangeText={setNuevaNota}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 8,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (nuevaNota.trim() !== "") {
                    const actualizadas = [...notas, nuevaNota.trim()];
                    guardarNotas(actualizadas);
                    setNuevaNota("");
                  }
                }}
                style={{
                  backgroundColor: "#007AFF",
                  marginLeft: 8,
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <FontAwesome name="plus" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </View>
        </View>
      );
    }
    

    if (pestana === "itinerario") {
      if (!viaje) return null;

      const inicio = new Date(viaje.fecha_inicio);
      const fin = new Date(viaje.fecha_fin);
      const dias: string[] = [];

      for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
        dias.push(new Date(d).toISOString().split("T")[0]);
      }

      const fechaFormateada = (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

      return (
        <View>
          {dias.map((fecha: string, i: number) => {
            const actividadesDelDia = viaje.actividades.filter(
              (a: any) => a.fecha_realizacion === fecha
            );
            return (
              <View key={fecha} style={estilos.dia}>
                <Text style={estilos.fechaDia}>Día {i + 1}: {fechaFormateada(fecha)}</Text>
                {actividadesDelDia.length === 0 ? (
                  <Text style={estilos.textoInfo}>Nada programado</Text>
                ) : (
                  actividadesDelDia.map((actividad: any) => (
                    <TouchableOpacity 
                      key={actividad.id} 
                      style={estilos.cardHorizontal}
                      onPress={() => navigation.navigate("DetalleActividad", { actividad })}
                    >
                      <Image source={{ uri: actividad.url_imagen }} style={estilos.cardImagen} />
                      <View style={{ flex: 1 }}>
                        <Text style={estilos.cardTitulo}>{actividad.nombre}</Text>
                        <Text style={estilos.cardTexto}>{actividad.direccion}</Text>
                        
                        
                      </View>
                      <TouchableOpacity onPress={() => confirmarEliminacion("actividad", actividad.id)}>
                        <FontAwesome name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                )}
                <View style={{ alignItems: "flex-end", marginHorizontal: 10, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    setModoBusqueda("actividad");
                    setFechaSeleccionada(fecha);
                    setModalVisible(true);
                  }}
                  style={{
                    backgroundColor: "#007AFF",
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome name="plus" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              </View>
            );
          })}
        </View>
      );
    }

    if (pestana === "gastos") {
      return (
        <View style={{ padding: 10 }}>
          <Text style={estilos.subtitulo}>Gastos del viaje:</Text>

          <View style={{ alignItems: "center", marginVertical: 10 }}>
            <Text style={{ fontSize: 26, fontWeight: "bold", color: "#007AFF" }}>
              Total: {totalGastado.toFixed(2)} €
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}>Ordenar por:</Text>
            <TouchableOpacity onPress={() => setOrden(orden === "fecha" ? "cantidad" : "fecha")}>
              <Text style={{ color: "#007AFF" }}>
                {orden === "fecha" ? "Cantidad" : "Fecha"}
              </Text>
            </TouchableOpacity>
          </View>
    
          {gastos.length === 0 ? (
            <Text style={estilos.textoInfo}>No hay gastos registrados</Text>
          ) : (
            gastos.map((gasto) => (
              <View key={gasto.id} style={estilos.cardHorizontal}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.cardTitulo}>{gasto.concepto}</Text>
                  <Text style={estilos.cardTexto}>{gasto.categoria} - {gasto.fecha}</Text>
                  <Text style={estilos.cardTexto}>{gasto.cantidad} €</Text>
                </View>
                <TouchableOpacity onPress={() => borrarGasto(gasto.id)}>
                  <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))
          )}
    
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[estilos.botonPublicar, estilos.botonAzul]}
              onPress={() => setMostrarModalGasto(true)}
            >
              <Text style={estilos.textoBoton}>Añadir gasto</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  if (!viaje) return <Text style={estilos.textoInfo}>Cargando...</Text>;

  return (
    <View style={[estilos.contenedor, { paddingTop: Platform.OS === "ios" ? 50 : 0 }]}>
      <ScrollView>
        <View style={estilos.encabezado}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={estilos.atras}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={estilos.nombreViaje}>{viaje.nombre}</Text>
            <Text>
              {new Date(viaje.fecha_inicio).toLocaleDateString()} -{" "}
              {new Date(viaje.fecha_fin).toLocaleDateString()}
            </Text>
          </View>
          <Image source={require("../assets/imagenes/user.png")} style={estilos.fotoPerfil} />
        </View>
  
        <Image source={{ uri: viaje.imagen_destacada }} style={estilos.imagenViaje} />
  
        <View style={estilos.pestanas}>
          <TouchableOpacity onPress={() => setPestana("descripcion")}>
            <Text style={pestana === "descripcion" ? estilos.pestanaActiva : estilos.pestana}>Descripción</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPestana("itinerario")}>
            <Text style={pestana === "itinerario" ? estilos.pestanaActiva : estilos.pestana}>Itinerario</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPestana("gastos")}>
            <Text style={pestana === "gastos" ? estilos.pestanaActiva : estilos.pestana}>Gastos</Text>
          </TouchableOpacity>
        </View>
  
        {renderizarContenido()}
        <BuscarActividadesHoteles
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          tipo={modoBusqueda} 
          fechaLimiteInicio={viaje?.fecha_inicio}
          fechaLimiteFin={viaje?.fecha_fin}
          fechaActividad={fechaSeleccionada}
          onSelect={manejarSeleccionLugar}
        />
        

      </ScrollView>

      <ComentarioPubli
          visible={mostrarModalComentario}
          onClose={() => setMostrarModalComentario(false)}
          comentario={comentario}
          onChangeComentario={setComentario}
          onPublicar={async () => {
            if (!comentario.trim()) {
              Alert.alert("Comentario requerido", "Debes añadir un comentario para publicar.");
              return;
            }

            const token = await AsyncStorage.getItem("access_token");
            const headers = { Authorization: `Bearer ${token}` };

            try {
              await api.post(`viaje_compartido/${viajeId}/publicar/`, { comentario }, { headers });
              setMostrarModalComentario(false);
              setComentario("");
              cargarDatos();
            } catch (err) {
              Alert.alert("Error", "No se pudo publicar el viaje.");
              console.error("Error publicando:", err);
            }
          }}
        />

        <ModalNuevoGasto
          visible={mostrarModalGasto}
          onClose={() => setMostrarModalGasto(false)}
          onGuardar={agregarGasto}
        />
  
      <View style={estilos.botonContenedor}>
        <TouchableOpacity
          style={[
            estilos.botonPublicar,
            estaPublicado ? estilos.botonGris : estilos.botonAzul,
          ]}
          onPress={() => {
            if (estaPublicado) {
              despublicarViaje();
            } else {
              setMostrarModalComentario(true);
            }
          }}
          
        >
          <Text style={estilos.textoBoton}>
            {estaPublicado ? "Dejar de publicar viaje" : "Publicar viaje"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
  
};

const estilos = StyleSheet.create({
  contenedor: { backgroundColor: "#fff", flex: 1 },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  atras: { fontSize: 22, fontWeight: "bold" },
  nombreViaje: { fontSize: 20, fontWeight: "bold" },
  fotoPerfil: { width: 40, height: 40, borderRadius: 20 },
  imagenViaje: { width: "100%", height: 200 },
  pestanas: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  pestana: { fontSize: 16, color: "gray" },
  pestanaActiva: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    textDecorationLine: "underline",
  },

  botonPublicado: {
    backgroundColor: "#007AFF",
  },
  botonDespublicado: {
    backgroundColor: "#FF3B30",
  },
  botonContenedor: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  botonPublicar: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  botonAzul: {
    backgroundColor: "#007AFF",
  },
  botonGris: {
    backgroundColor: "#ccc",
  },
  textoBoton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  
  subtitulo: { fontSize: 18, fontWeight: "bold", marginHorizontal: 10, marginTop: 10 },
  textoInfo: { marginHorizontal: 10, color: "gray", fontStyle: "italic" },
  dia: { marginBottom: 20 },
  fechaDia: { marginLeft: 10, fontWeight: "bold", marginTop: 10, fontSize: 16 },
  cardHorizontal: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    padding: 10,
    alignItems: "center",
  },
  cardImagen: { width: 90, height: 90, borderRadius: 12, marginRight: 10 },
  cardTitulo: { fontWeight: "bold", fontSize: 15 },
  cardTexto: { color: "gray", fontSize: 13 },
  mapa: { color: "#00B2CA", marginTop: 5, fontWeight: "500" },
});

export default PantallaDetalleViaje;
