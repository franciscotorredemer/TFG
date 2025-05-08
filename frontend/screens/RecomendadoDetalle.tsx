import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useRoute, useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"

export default function RecomendadoDetalle() {
  const { params } = useRoute()
  const navigation = useNavigation()
  const viaje = params?.viajeRecomendado

  const [fechaInicio, setFechaInicio] = useState(new Date())
  const [fechaFin, setFechaFin] = useState(new Date())

  const crearViaje = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      const headers = { Authorization: `Bearer ${token}` }

      const res = await api.post(
        "viajes/",
        {
          nombre: viaje.nombre,
          ciudad: viaje.ciudad,
          imagen_destacada: viaje.imagen_destacada,
          fecha_inicio: fechaInicio.toISOString().split("T")[0],
          fecha_fin: fechaFin.toISOString().split("T")[0],
        },
        { headers }
      )

      const viajeId = res.data.id

      // Añadir actividades con sus datos reales
      for (const act of viaje.actividades || []) {
        await api.post(
          `viajes/${viajeId}/agregar_actividad/`,
          {
            nombre: act.nombre,
            descripcion: act.descripcion || "",
            direccion: act.direccion || "",
            url_imagen: act.url_imagen || null,
            fecha_realizacion: act.fecha_realizacion,
          },
          { headers }
        )
      }

      // Añadir estancias de hotel
      for (const estancia of viaje.estancias || []) {
        const hotel = estancia.hotel
        await api.post(
          `viajes/${viajeId}/agregar_hotel/`,
          {
            nombre: hotel.nombre,
            direccion: hotel.direccion,
            pais: hotel.pais,
            descripcion: hotel.descripcion,
            imagen: hotel.imagen,
            latitud: hotel.latitud,
            longitud: hotel.longitud,
            fecha_inicio: estancia.fecha_inicio,
            fecha_fin: estancia.fecha_fin,
          },
          { headers }
        )
      }

      Alert.alert("Éxito", "Tu viaje ha sido creado.", [
        { text: "OK", onPress: () => navigation.navigate("Tabs") },
      ])
    } catch (error) {
      console.error(error)
      Alert.alert("Error", "Hubo un problema al crear el viaje.")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tus fechas</Text>

      <Text style={styles.label}>Inicio</Text>
      <DateTimePicker
        value={fechaInicio}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={(e, d) => d && setFechaInicio(d)}
      />

      <Text style={styles.label}>Fin</Text>
      <DateTimePicker
        value={fechaFin}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={(e, d) => d && setFechaFin(d)}
      />

      <TouchableOpacity style={styles.button} onPress={crearViaje}>
        <Text style={styles.buttonText}>Crear viaje con este plan</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "500",
  },
  button: {
    marginTop: 40,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
