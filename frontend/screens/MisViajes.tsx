import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { NavigationProp } from "@react-navigation/native";

interface Viaje {
  id: number;
  nombre: string;
  ciudad: string;
  fecha_inicio: string;
  fecha_fin: string;
  imagen_destacada: string;
}

interface Props {
  navigation: NavigationProp<any>;
}

const MisViajes: React.FC<Props> = ({ navigation }) => {
  const [viajes, setViajes] = useState<Viaje[]>([]);

  useEffect(() => {
    const fetchViajes = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const response = await api.get("mis_viajes/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setViajes(response.data);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los viajes.");
      }
    };

    fetchViajes();
  }, []);

  const renderItem = ({ item }: { item: Viaje }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("CLICK EN VIAJE", item.id); // DEBUG
        navigation.navigate("DetalleViaje", { viajeId: item.id });
      }}
      style={estilos.bloqueViaje}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imagen_destacada }} style={estilos.imagenViaje} />
      <View style={estilos.detallesViaje}>
        <Text style={estilos.titulo}>{item.nombre}</Text>
        <Text style={estilos.fechas}>
          {new Date(item.fecha_inicio).toLocaleDateString()} -{" "}
          {new Date(item.fecha_fin).toLocaleDateString()}
        </Text>
        <Text style={estilos.ciudad}>{item.ciudad}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={estilos.container}>
      <Text style={estilos.header}>Mis Viajes</Text>
      <FlatList
        data={viajes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={estilos.lista}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#347CAF",
    marginBottom: 20,
    textAlign: "center",
  },
  lista: {
    paddingBottom: 20,
  },
  bloqueViaje: {
    marginBottom: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  imagenViaje: {
    width: "100%",
    height: 180,
  },
  detallesViaje: {
    padding: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  fechas: {
    fontSize: 14,
    color: "gray",
    marginBottom: 3,
  },
  ciudad: {
    fontSize: 14,
    color: "#347CAF",
  },
});

export default MisViajes;
