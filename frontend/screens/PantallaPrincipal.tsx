import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import MenuInferior from "../components/MenuInferior";
import { FontAwesome } from "@expo/vector-icons";
import TarjetaViaje from "../components/TarjetaViaje"; // Asegúrate de tenerlo

// Imágenes
const logo = require("../assets/imagenes/logo.png");
const fotoPerfil = require("../assets/imagenes/user.png");

interface Viaje {
  id: number;
  nombre: string;
  ciudad: string;
  fecha_inicio: string;
  fecha_fin: string;
  actividades: any[];
  imagen_destacada: string;
}

interface PantallaPrincipalProps {
  navigation: NavigationProp<any>;
}

const PantallaPrincipal: React.FC<PantallaPrincipalProps> = ({ navigation }) => {
  const [viajes, setViajes] = useState<Viaje[]>([]);

  const cargarViajes = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const respuesta = await api.get("mis_viajes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViajes(respuesta.data);
    } catch (error) {
      console.error("Error al cargar los viajes:", error);
    }
  };

  useEffect(() => {
    cargarViajes();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await api.delete(`viajes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViajes((prev) => prev.filter((viaje) => viaje.id !== id));
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el viaje.");
    }
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={estilos.encabezado}>
          <Image source={logo} style={estilos.logo} />
          <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
            <Image source={fotoPerfil} style={estilos.fotoPerfil} />
          </TouchableOpacity>
        </View>

        {/* Sección de viajes */}
        <View style={estilos.filaSeccion}>
          <Text style={estilos.tituloSeccion}>Mis viajes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("MisViajes")}>
            <Text style={estilos.botonVerTodo}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de viajes */}
        {viajes.map((viaje) => (
          <TarjetaViaje
            key={viaje.id}
            nombre={viaje.nombre}
            ciudad={viaje.ciudad}
            fecha_inicio={viaje.fecha_inicio}
            fecha_fin={viaje.fecha_fin}
            imagen_destacada={viaje.imagen_destacada}
            actividades={viaje.actividades.length}
            onPress={() => navigation.navigate("DetalleViaje", { viajeId: viaje.id })}
            onDelete={() => handleDelete(viaje.id)}
          />
        ))}

        {/* Buscador */}
        <Text style={estilos.mensajeNuevoViaje}>¡Empieza un nuevo viaje!</Text>
        <View style={estilos.buscador}>
          <FontAwesome name="search" size={20} color="#007AFF" style={estilos.iconoBuscar} />
          <TextInput
            style={estilos.entradaBusqueda}
            placeholder="Barcelona, París..."
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Espacio para que no solape */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Menú inferior */}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 60,
    resizeMode: "contain",
  },
  fotoPerfil: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  filaSeccion: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  tituloSeccion: {
    fontSize: 22,
    fontWeight: "bold",
  },
  botonVerTodo: {
    fontSize: 16,
    color: "#007AFF",
  },
  mensajeNuevoViaje: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 40,
    marginHorizontal: 20,
    marginTop: 10,
  },
  iconoBuscar: {
    marginRight: 10,
  },
  entradaBusqueda: {
    flex: 1,
    fontSize: 16,
  },
});

export default PantallaPrincipal;
