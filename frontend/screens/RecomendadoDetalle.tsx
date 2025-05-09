import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useRoute, useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { Ionicons } from "@expo/vector-icons"

export default function RecomendadoDetalle() {
  const { params } = useRoute()
  const navigation = useNavigation()
  const viaje = params?.viajeRecomendado

  const [fechaInicio, setFechaInicio] = useState(new Date())
  const [fechaFin, setFechaFin] = useState(new Date())
  const [showInicioPicker, setShowInicioPicker] = useState(false)
  const [showFinPicker, setShowFinPicker] = useState(false)

  const crearViaje = async () => {
    if (fechaFin < fechaInicio) {
      Alert.alert(
        "Fechas inválidas",
        "La fecha de fin no puede ser anterior a la de inicio. Por favor, corrige las fechas."
      )
      return
    }

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

      for (const act of viaje.actividades || []) {
        const fecha = new Date(fechaInicio)
        fecha.setDate(fecha.getDate() + act.fecha_offset)

        await api.post(
          `viajes/${viajeId}/asociar_actividad/`,
          {
            actividad_id: act.actividad_id,
            fecha_realizacion: fecha.toISOString().split("T")[0],
          },
          { headers }
        )
      }

      for (const h of viaje.hoteles || []) {
        await api.post(
          `viajes/${viajeId}/asociar_hotel/`,
          {
            hotel_id: h.hotel_id,
            fecha_inicio: fechaInicio.toISOString().split("T")[0],
            fecha_fin: fechaFin.toISOString().split("T")[0],
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {viaje?.imagen_destacada && (
        <Image source={{ uri: viaje.imagen_destacada }} style={styles.image} />
      )}
      <Text style={styles.title}>{viaje?.nombre}</Text>

      <Text style={styles.label}>Inicio: {fechaInicio.toLocaleDateString()}</Text>
      <TouchableOpacity onPress={() => setShowInicioPicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Cambiar fecha de inicio</Text>
      </TouchableOpacity>
      {showInicioPicker && (
        <DateTimePicker
          value={fechaInicio}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, date) => {
            setShowInicioPicker(false)
            if (date) setFechaInicio(date)
          }}
        />
      )}

      <Text style={styles.label}>Fin: {fechaFin.toLocaleDateString()}</Text>
      <TouchableOpacity onPress={() => setShowFinPicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Cambiar fecha de fin</Text>
      </TouchableOpacity>
      {showFinPicker && (
        <DateTimePicker
          value={fechaFin}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, date) => {
            setShowFinPicker(false)
            if (date) setFechaFin(date)
          }}
        />
      )}

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
    justifyContent: "flex-start",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 60,
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
  dateButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
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
