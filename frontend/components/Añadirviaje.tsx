import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { subirImagenPerfil } from "../services/subirImagenBucket"

const imagenesPorDefecto = [
  require("../assets/imagenes/fotoviaje1.jpeg"),
    //require("../assets/imagenes/fotoviaje2.jpeg")
]

export default function AñadirViaje() {
  const navigation = useNavigation()

  const [nombre, setNombre] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [imagenLocal, setImagenLocal] = useState<string | null>(null)
  const [fechaInicio, setFechaInicio] = useState(new Date())
  const [fechaFin, setFechaFin] = useState(new Date())
  const [showInicioPicker, setShowInicioPicker] = useState(false)
  const [showFinPicker, setShowFinPicker] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Se necesita acceso a la galería")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets.length > 0) {
      setImagenLocal(result.assets[0].uri)
    }
  }

  const crearViaje = async () => {
    if (!nombre || !ciudad) {
      Alert.alert("Campos incompletos", "Por favor completa nombre y ciudad")
      return
    }

    if (fechaFin < fechaInicio) {
      Alert.alert("Fechas inválidas", "La fecha de fin no puede ser anterior a la de inicio")
      return
    }

    setCargando(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const headers = { Authorization: `Bearer ${token}` }

      let imagenFinal = ""

      if (imagenLocal?.startsWith("file://")) {
        setSubiendo(true)
        const subida = await subirImagenPerfil(imagenLocal, nombre.replace(/\s/g, "_"))
        imagenFinal = subida || ""
        setSubiendo(false)
      }

      if (!imagenFinal) {
        const aleatoria = imagenesPorDefecto[Math.floor(Math.random() * imagenesPorDefecto.length)]
        imagenFinal = Image.resolveAssetSource(aleatoria).uri
      }

      await api.post("viajes/", {
        nombre,
        ciudad,
        imagen_destacada: imagenFinal,
        fecha_inicio: fechaInicio.toISOString().split("T")[0],
        fecha_fin: fechaFin.toISOString().split("T")[0],
      }, { headers })

      Alert.alert("Éxito", "Tu viaje ha sido creado", [
        { text: "OK", onPress: () => navigation.goBack() }
      ])
    } catch (error) {
      console.error(error)
      Alert.alert("Error", "No se pudo crear el viaje")
    } finally {
      setCargando(false)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Nuevo Viaje</Text>

      <TextInput
        placeholder="Nombre del viaje"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Ciudad"
        value={ciudad}
        onChangeText={setCiudad}
        style={styles.input}
      />

      <TouchableOpacity onPress={handlePickImage} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>Seleccionar imagen destacada</Text>
      </TouchableOpacity>

      {imagenLocal && (
        <Image source={{ uri: imagenLocal }} style={styles.previewImage} />
      )}

      <Text style={styles.label}>Inicio: {fechaInicio.toLocaleDateString()}</Text>
      <TouchableOpacity onPress={() => setShowInicioPicker(true)} style={styles.dateButton}>
        <Text>Cambiar fecha de inicio</Text>
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
        <Text>Cambiar fecha de fin</Text>
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

      <TouchableOpacity style={styles.button} onPress={crearViaje} disabled={cargando || subiendo}>
        {(cargando || subiendo) ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear viaje</Text>}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "500",
  },
  dateButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    marginTop: 30,
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
  imageButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  imageButtonText: {
    color: "#333",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
})
