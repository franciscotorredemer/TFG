import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { NavigationProp } from "@react-navigation/native";
import TarjetaViaje from "../components/TarjetaViaje";

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

  const eliminarViaje = async (viajeId: number) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await api.delete(`viajes/${viajeId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViajes((prev) => prev.filter((v) => v.id !== viajeId));
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el viaje.");
    }
  };

  useEffect(() => {
    fetchViajes();
  }, []);

  const renderItem = ({ item }: { item: Viaje }) => (
    <TarjetaViaje
      nombre={item.nombre}
      ciudad={item.ciudad}
      fecha_inicio={item.fecha_inicio}
      fecha_fin={item.fecha_fin}
      imagen_destacada={item.imagen_destacada}
      onPress={() => navigation.navigate("DetalleViaje", { viajeId: item.id })}
      onDelete={() => eliminarViaje(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
        <Text style={styles.textoAtras}>←</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Mis Viajes</Text>
      <FlatList
        data={viajes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  botonAtras: {
    marginLeft: 20,
    marginBottom: 10,
  },
  textoAtras: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#347CAF",
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
});

export default MisViajes;