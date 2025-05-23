// Archivo: PantallaPerfilUsuario.tsx

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

const avatarPorDefecto = require("../assets/imagenes/user.png")

const PantallaPerfilUsuario = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { id } = route.params as { id: number }

  const [usuario, setUsuario] = useState<any>(null)
  const [viajes, setViajes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [estadoRelacion, setEstadoRelacion] = useState<"pendiente" | "aceptada" | null>(null)
  const [procesando, setProcesando] = useState(false)

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const headers = { Authorization: `Bearer ${token}` }

      const [info, estado, compartidos] = await Promise.all([
        api.get(`relacion/${id}/info/`, { headers }),
        api.get(`relacion/${id}/estado/`, { headers }),
        api.get(`viaje_compartido/?publicado_por=${id}`, { headers }),
      ])

      setUsuario(info.data)
      setEstadoRelacion(estado.data.estado)
      setViajes(compartidos.data)
    } catch (error) {
      console.error("Error al cargar perfil de otro usuario:", error)
    } finally {
      setCargando(false)
    }
  }

  const toggleSeguir = async () => {
  setProcesando(true)
  try {
    const token = await AsyncStorage.getItem("access_token")
    const headers = { Authorization: `Bearer ${token}` }

    if (estadoRelacion === "aceptada" || estadoRelacion === "pendiente") {
      await api.delete(`relacion/${id}/`, { headers })
      setEstadoRelacion(null)
    } else {
      await api.post("relacion/", { seguido: id }, { headers })
      setEstadoRelacion("pendiente")
    }
  } catch (error) {
    console.error("Error al seguir/dejar de seguir:", error)
  } finally {
    setProcesando(false)
  }
}


  useEffect(() => {
    cargarDatos()
  }, [id])

  if (cargando || !usuario) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{usuario.username}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.profileSection}>
        <Image
          source={usuario.foto_perfil ? { uri: usuario.foto_perfil } : avatarPorDefecto}
          style={styles.avatar}
        />
        <Text style={styles.username}>{usuario.username}</Text>
      
        {/* <Text style={styles.email}>{usuario.email}</Text> */}

        {usuario.bio ? <Text style={styles.bio}>{usuario.bio}</Text> : null}
        {usuario.ubicacion ? <Text style={styles.location}>{usuario.ubicacion}</Text> : null}

        <TouchableOpacity
          style={[
            styles.followButton,
            estadoRelacion === "aceptada" ? styles.following : styles.notFollowing
          ]}
          onPress={toggleSeguir}
          disabled={procesando || estadoRelacion === "pendiente"}
        >
          {procesando ? (
            <ActivityIndicator size="small" color={estadoRelacion === "aceptada" ? "#fff" : "#007AFF"} />
          ) : (
            <Text
              style={[
                styles.followText,
                estadoRelacion === "aceptada" ? styles.whiteText : styles.blueText
              ]}
            >
              {estadoRelacion === "pendiente"
                ? "Pendiente"
                : estadoRelacion === "aceptada"
                ? "Siguiendo"
                : "Seguir"}
            </Text>
          )}
        </TouchableOpacity>

      </View>

      <View style={styles.sectionTitleBox}>
        <Text style={styles.sectionTitle}>Viajes compartidos</Text>
      </View>

      {viajes.length === 0 ? (
        <Text style={styles.noTrips}>Este usuario aún no ha compartido viajes.</Text>
      ) : (
        viajes.map((viaje) => (
          <TouchableOpacity
            key={viaje.id}
            style={styles.tripCard}
            onPress={() => navigation.navigate("DetalleCompartido", { id: viaje.id })}
          >
            <Image source={{ uri: viaje.viaje.imagen_destacada }} style={styles.tripImage} />
            <Text style={styles.tripName}>{viaje.viaje.nombre}</Text>
            <Text numberOfLines={2} style={styles.tripComment}>{viaje.comentario}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#f5f5f5",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  email: {
    color: "#666",
    marginBottom: 8,
  },
  bio: {
    fontStyle: "italic",
    color: "#444",
    marginBottom: 6,
  },
  location: {
    color: "#666",
    marginBottom: 16,
  },
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  following: {
    backgroundColor: "#007AFF",
  },
  notFollowing: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  followText: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  whiteText: {
    color: "#fff",
  },
  blueText: {
    color: "#007AFF",
  },
  sectionTitleBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  noTrips: {
    padding: 16,
    color: "#666",
    fontStyle: "italic",
  },
  tripCard: {
    backgroundColor: "#f9f9f9",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    padding: 12,
  },
  tripImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  tripName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  tripComment: {
    color: "#555",
    marginTop: 4,
  },
})

export default PantallaPerfilUsuario
