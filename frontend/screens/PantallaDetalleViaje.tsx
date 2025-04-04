import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";

type Props = StackScreenProps<RootStackParamList, "DetalleViaje">;

const PantallaDetalleViaje: React.FC<Props> = ({ navigation, route }) => {
  const [pestana, setPestana] = useState<"descripcion" | "itinerario" | "gastos">("descripcion");
  const [viaje, setViaje] = useState<any>(null);
  const [hoteles, setHoteles] = useState<any[]>([]);
  const { viajeId } = route.params;

  useEffect(() => {
    const cargarDatos = async () => {
      const token = await AsyncStorage.getItem("access_token");

      const respuestaViaje = await api.get(`viajes/${viajeId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViaje(respuestaViaje.data);

      const respuestaHoteles = await api.get(`hoteles/?viaje=${viajeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoteles(respuestaHoteles.data);
    };

    cargarDatos();
  }, [viajeId]);

  const getDiasDelViaje = () => {
    const dias = [];
    const inicio = new Date(viaje.fecha_inicio);
    const fin = new Date(viaje.fecha_fin);
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      dias.push(new Date(d));
    }
    return dias;
  };

  const agruparActividadesPorFecha = () => {
    const agrupado: Record<string, any[]> = {};
    viaje.actividades.forEach((actividad: any) => {
      const fecha = actividad.fecha_realizacion;
      if (!agrupado[fecha]) agrupado[fecha] = [];
      agrupado[fecha].push(actividad);
    });
    return agrupado;
  };

  const renderDescripcion = () => (
    <View>
      {hoteles.map((hotel) => (
        <View key={hotel.id} style={estilos.tarjetaHotel}>
          <Image source={{ uri: hotel.imagen }} style={estilos.imagenHotel} />
          <Text style={estilos.nombreHotel}>{hotel.nombre}</Text>
          <Text>{hotel.descripcion}</Text>
          <Text style={estilos.info}>{hotel.ciudad}, {hotel.pais}</Text>
        </View>
      ))}
    </View>
  );

  const renderItinerario = () => {
    const actividadesPorFecha = agruparActividadesPorFecha();
    const dias = getDiasDelViaje();

    return dias.map((fecha, i) => {
      const fechaISO = fecha.toISOString().split("T")[0];
      const actividades = actividadesPorFecha[fechaISO] || [];

      return (
        <View key={i} style={{ marginBottom: 20 }}>
          <Text style={estilos.diaTitulo}>
            Día {i + 1}: {fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </Text>

          {actividades.length === 0 ? (
            <Text style={estilos.nada}>Nada programado</Text>
          ) : (
            actividades.map((actividad, j) => (
              <View key={j} style={estilos.tarjetaActividad}>
                <Image source={{ uri: actividad.url_imagen }} style={estilos.imagenActividad} />
                <View style={{ flex: 1 }}>
                  <Text style={estilos.nombreActividad}>{actividad.nombre}</Text>
                  <Text style={estilos.subtexto}>{actividad.ciudad}, {actividad.ubicacion}</Text>
                  <Text style={estilos.link}>Marcar en mapa</Text>
                </View>
              </View>
            ))
          )}
        </View>
      );
    });
  };

  const renderGastos = () => (
    <Text style={{ padding: 15 }}>Sección de gastos (pendiente)</Text>
  );

  if (!viaje) return <Text style={{ padding: 20 }}>Cargando viaje...</Text>;

  return (
    <ScrollView style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={estilos.atras}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={estilos.nombreViaje}>{viaje.nombre}</Text>
          <Text>{new Date(viaje.fecha_inicio).toLocaleDateString()} a {new Date(viaje.fecha_fin).toLocaleDateString()}</Text>
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

      {pestana === "descripcion" && renderDescripcion()}
      {pestana === "itinerario" && renderItinerario()}
      {pestana === "gastos" && renderGastos()}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  contenedor: { backgroundColor: "#fff" },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15 },
  atras: { fontSize: 24, fontWeight: "bold" },
  nombreViaje: { fontSize: 20, fontWeight: "bold" },
  fotoPerfil: { width: 40, height: 40, borderRadius: 20 },
  imagenViaje: { width: "100%", height: 200 },
  pestanas: { flexDirection: "row", justifyContent: "space-around", marginVertical: 15 },
  pestana: { fontSize: 16, color: "gray" },
  pestanaActiva: { fontSize: 16, fontWeight: "bold", color: "#007AFF", textDecorationLine: "underline" },
  tarjetaHotel: { padding: 10, margin: 10, backgroundColor: "#f2f2f2", borderRadius: 10 },
  imagenHotel: { width: "100%", height: 150, borderRadius: 10 },
  nombreHotel: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
  info: { fontSize: 14, color: "gray" },
  diaTitulo: { fontSize: 16, fontWeight: "bold", paddingHorizontal: 15 },
  nada: { paddingHorizontal: 15, fontStyle: "italic", color: "gray" },
  tarjetaActividad: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    margin: 10,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  imagenActividad: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  nombreActividad: { fontWeight: "bold", fontSize: 16 },
  subtexto: { color: "gray", fontSize: 14 },
  link: { color: "#00AEEF", marginTop: 4 },
});

export default PantallaDetalleViaje;
