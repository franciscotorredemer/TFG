import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator 
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import MenuInferior from "../components/MenuInferior";
import { FontAwesome } from "@expo/vector-icons";

interface Viaje {
  id: number;
  nombre: string;
  ciudad: string;
  fecha_inicio: string;
  fecha_fin: string;
  actividades: any[];
  imagen_destacada: string;
}

interface PropsMisViajes {
  navigation: NavigationProp<any>;
}

const MisViajes: React.FC<PropsMisViajes> = ({ navigation }) => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerViajes = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const respuesta = await api.get("viajes/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setViajes(respuesta.data);
      } catch (error) {
        console.error("Error al cargar los viajes:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerViajes();
  }, []);

  return (
    <View style={estilos.pantalla}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={estilos.encabezado}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={estilos.titulo}>Todos mis viajes</Text>
          <View style={{ width: 24 }} /> {/* Dejamos espacio */}
        </View>

        {/* Pantalla de carga */}
        {cargando ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
        ) : (
          viajes.map((viaje) => (
            <View key={viaje.id} style={estilos.bloqueViaje}>
              <Image source={{ uri: viaje.imagen_destacada }} style={estilos.imagenViaje} />
              <View style={estilos.infoViaje}>
                <Text style={estilos.nombreViaje}>{viaje.nombre}</Text>
                <Text style={estilos.textoFechas}>
                  {new Date(viaje.fecha_inicio).toLocaleDateString()} - {new Date(viaje.fecha_fin).toLocaleDateString()}
                </Text>
                <Text style={estilos.textoActividades}>{viaje.actividades.length} actividades</Text>
              </View>
            </View>
          ))
        )}

        {/* Espacio al final */}
        <View style={{ height: 80 }} />
      </ScrollView>

      <MenuInferior navigation={navigation} />
    </View>
  );
};

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
  },
  bloqueViaje: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  imagenViaje: {
    width: 120,
    height: 80,
    borderRadius: 10,
  },
  infoViaje: {
    flex: 1,
    paddingLeft: 15,
  },
  nombreViaje: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textoFechas: {
    fontSize: 14,
    color: "gray",
    marginTop: 3,
  },
  textoActividades: {
    fontSize: 14,
    color: "gray",
    marginTop: 2,
  },
});

export default MisViajes;
