import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert, Image } from "react-native";
import api from "../services/api";
import { Activity } from "../types/Activity"; 

export const ActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get("actividades/");
        console.log("Datos recibidos:", response.data); 
        setActivities(response.data);
      } catch (error) {
        Alert.alert("Error", "No tienes permisos o el token es inválido");
      }
    };

    fetchActivities();
  }, []);

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.url_imagen }} style={styles.image} />
          <Text style={styles.name}>{item.nombre || "Sin nombre"}</Text>
          <Text>{item.descripcion || "Sin descripción"}</Text>
          <Text style={styles.info}>Ciudad: {item.ciudad}</Text>
          <Text style={styles.info}>Ubicación: {item.ubicacion}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    fontSize: 14,
    color: "gray",
  },
});

export default ActivityList;
