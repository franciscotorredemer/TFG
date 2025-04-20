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

type Props = StackScreenProps<RootStackParamList, "DetalleViaje">;

const PantallaDetalleViaje: React.FC<Props> = ({ navigation, route }) => {
  const [pestana, setPestana] = useState<"descripcion" | "itinerario" | "gastos">("descripcion");
  const [viaje, setViaje] = useState<any>(null);
  const { viajeId } = route.params;
  const [estaPublicado, setEstaPublicado] = useState<boolean>(false);


  const cargarDatos = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const respuestaViaje = await api.get(`viajes/${viajeId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setViaje(respuestaViaje.data);

    const estado = await api.get(`viaje_compartido/${viajeId}/esta_publicado/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEstaPublicado(estado.data.publicado);
  };

  useEffect(() => {
    cargarDatos();
  }, [viajeId]);

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
          {viaje?.hoteles?.length === 0 ? (
            <Text style={estilos.textoInfo}>No hay hoteles registrados</Text>
          ) : (
            viaje?.hoteles?.map((hotel: any) => (
              <View key={hotel.id} style={estilos.cardHorizontal}>
                <Image source={{ uri: hotel.imagen }} style={estilos.cardImagen} />
                <View style={{ flex: 1 }}>
                  <Text style={estilos.cardTitulo}>{hotel.nombre}</Text>
                  <Text style={estilos.cardTexto}>{hotel.descripcion}</Text>
                  <Text style={estilos.cardTexto}>{hotel.ciudad}, {hotel.pais}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmarEliminacion("hotel", hotel.id)}>
                  <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))
          )}
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
                        <Text style={estilos.cardTexto}>{actividad.ciudad}, España</Text>
                        <Text style={estilos.cardTexto}>{actividad.ubicacion}</Text>
                        <Text style={estilos.mapa}>Marcar en mapa</Text>
                      </View>
                      <TouchableOpacity onPress={() => confirmarEliminacion("actividad", actividad.id)}>
                        <FontAwesome name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            );
          })}
        </View>
      );
    }

    return <Text style={estilos.textoInfo}>Sección de gastos (pendiente)</Text>;
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
      </ScrollView>
  
      <View style={estilos.botonContenedor}>
        <TouchableOpacity
          style={[
            estilos.botonPublicar,
            estaPublicado ? estilos.botonGris : estilos.botonAzul,
          ]}
          onPress={() => {
            Alert.alert(
              estaPublicado ? "¿Dejar de publicar?" : "¿Publicar este viaje?",
              estaPublicado
                ? "Esto hará que el viaje ya no esté disponible públicamente."
                : "Esto compartirá tu viaje con otros usuarios.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: estaPublicado ? "Dejar de publicar" : "Publicar",
                  onPress: async () => {
                    const token = await AsyncStorage.getItem("access_token");
                    const headers = { Authorization: `Bearer ${token}` };
                    try {
                      if (estaPublicado) {
                        await api.post(`viaje_compartido/${viajeId}/despublicar/`, {}, { headers });
                      } else {
                        Alert.prompt(
                          "Comentario",
                          "Añade un comentario para compartir este viaje (visible para otros usuarios):",
                          [
                            { text: "Cancelar", style: "cancel" },
                            {
                              text: "Publicar",
                              onPress: async (comentario) => {
                                if (!comentario || comentario.trim() === "") {
                                  Alert.alert("Comentario requerido", "Debes añadir un comentario para publicar.");
                                  return;
                                }
                        
                                try {
                                  await api.post(`viaje_compartido/${viajeId}/publicar/`, { comentario }, { headers });
                                  cargarDatos();
                                } catch (err) {
                                  Alert.alert("Error", "No se pudo publicar el viaje.");
                                  console.error("Error publicando:", err);
                                }
                              },
                            },
                          ],
                          "plain-text"
                        );
                        
                      }
                      cargarDatos();
                    } catch (err) {
                      Alert.alert("Error", "No se pudo actualizar el estado del viaje.");
                    }
                  },
                  style: "destructive",
                },
              ]
            );
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
