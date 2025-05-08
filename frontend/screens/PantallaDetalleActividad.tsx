
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height } = Dimensions.get("window");

type Props = {
  route: RouteProp<RootStackParamList, "DetalleActividad">;
};

const PantallaDetalleActividad: React.FC<Props> = ({ route }) => {
  const { actividad, viajeId } = route.params as any;
  const navigation = useNavigation();
  const [añadida, setAñadida] = useState(!!actividad.fecha_realizacion);

  const toggleActividadEnViaje = async () => {
    const token = await AsyncStorage.getItem("access_token");

    if (!viajeId) {
      Alert.alert("Error", "No se ha proporcionado un viaje.");
      return;
    }

    try {
      if (añadida) {
        // Buscar la relación actividad_en_viaje
        const response = await api.get("actividades_en_viaje/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const match = response.data.find(
          (aev: any) => aev.viaje === viajeId && aev.actividad === actividad.id
        );

        if (match) {
          await api.delete(`actividades_en_viaje/${match.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAñadida(false);
        }
      } else {
        const hoy = new Date().toISOString().split("T")[0];
        await api.post(
          "actividades_en_viaje/",
          {
            viaje: viajeId,
            actividad: actividad.id,
            fecha_realizacion: hoy,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAñadida(true);
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al modificar la actividad.");
    }
  };

  return (
    <View style={styles.overlay}>
      <Image source={{ uri: actividad.url_imagen }} style={styles.image} />

      <View style={styles.sheet}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{actividad.nombre}</Text>
          <Text style={styles.ubicacion}>{actividad.direccion} · {actividad.ubicacion}</Text>
          <Text style={styles.descripcion}>{actividad.descripcion}</Text>
          {actividad.fecha_realizacion && (
            <Text style={styles.fecha}>Fecha: {actividad.fecha_realizacion}</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.boton} onPress={toggleActividadEnViaje}>
          <Text style={styles.botonTexto}>
            {añadida ? "Quitar del viaje" : "Añadir a viaje"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000aa",
  },
  image: {
    width: "100%",
    height: height * 0.4,
  },
  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: -40,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ubicacion: {
    fontSize: 16,
    color: "#347CAF",
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
  },
  fecha: {
    fontSize: 13,
    color: "gray",
  },
  boton: {
    backgroundColor: "#FF5A5F",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PantallaDetalleActividad;
