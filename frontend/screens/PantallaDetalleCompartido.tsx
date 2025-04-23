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
  Alert,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

const avatarDefault = require("../assets/imagenes/user.png")

export const PantallaDetalleCompartido = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { id } = route.params as { id: number }

  const [viaje, setViaje] = useState<any>(null)
  const [autor, setAutor] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [usuarioId, setUsuarioId] = useState<number | null>(null)

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const headers = { Authorization: `Bearer ${token}` }
  
      const res = await api.get(`viaje_compartido/${id}/`, { headers })
      setViaje(res.data)
  
      const autorInfo = await api.get(`relacion/${res.data.publicado_por}/info/`, { headers })
      const estado = await api.get(`relacion/${res.data.publicado_por}/estado/`, { headers })
      const perfil = await api.get("perfil/", { headers }) // <--- Aquí
  
      setUsuarioId(perfil.data.id) // <--- Guarda tu ID
  
      setAutor({
        ...autorInfo.data,
        siguiendo: estado.data.siguiendo,
      })
    } catch (error) {
      console.error("Error al cargar datos del viaje compartido", error)
    } finally {
      setCargando(false)
    }
  }
  

  const verPerfilAutor = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      const res = await api.get("perfil/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.id === autor.id) {
        navigation.navigate("Perfil")
      } else {
        navigation.navigate("PantallaPerfilUsuario", { id: autor.id })
      }
    } catch (error) {
      console.error("Error al navegar al perfil del autor:", error)
    }
  }
  
  

  const toggleLike = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      const headers = { Authorization: `Bearer ${token}` }
      const url = viaje.ya_dado_like
        ? `viaje_compartido/${viaje.id}/unlike/`
        : `viaje_compartido/${viaje.id}/like/`
      await api.post(url, {}, { headers })
      cargarDatos()
    } catch (error) {
      console.error("Error al dar/quitar like", error)
    }
  }

  const toggleSeguir = async () => {
    setIsProcessing(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const headers = { Authorization: `Bearer ${token}` }

     

      if (autor.siguiendo) {
        await api.delete(`relacion/${autor.id}/`, { headers })
      } else {
        await api.post("relacion/", { seguido: autor.id }, { headers })
      }

      setAutor((prev: any) => ({
        ...prev,
        siguiendo: !prev.siguiendo,
      }))
    } catch (error) {
      console.error("Error al actualizar seguimiento", error)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [id])

  if (cargando || !viaje || !autor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  const fechaFormateada = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long" })

  const inicio = new Date(viaje.viaje.fecha_inicio)
  const fin = new Date(viaje.viaje.fecha_fin)
  const dias: string[] = []
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    dias.push(new Date(d).toISOString().split("T")[0])
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{viaje.viaje.nombre}</Text>
          <Text style={styles.dates}>
            {fechaFormateada(viaje.viaje.fecha_inicio)} a {fechaFormateada(viaje.viaje.fecha_fin)}
          </Text>
        </View>
        <TouchableOpacity onPress={toggleLike} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.likes}>{viaje.likes_count}</Text>
          <Ionicons
            name={viaje.ya_dado_like ? "heart" : "heart-outline"}
            size={26}
            color="red"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.userSection}>
      <TouchableOpacity onPress={verPerfilAutor}>
        <Image source={autor.foto_perfil ? { uri: autor.foto_perfil } : avatarDefault} style={styles.avatar} />
      </TouchableOpacity>
        <View>
        <TouchableOpacity onPress={verPerfilAutor}>
         <Text style={styles.username}>{autor.username}</Text>
        </TouchableOpacity>
        {usuarioId !== autor.id && (
        <TouchableOpacity
          style={[styles.followButton, autor.siguiendo ? styles.followingButton : styles.notFollowingButton]}
          onPress={toggleSeguir}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={autor.siguiendo ? "#fff" : "#007AFF"} />
          ) : (
            <>
              {autor.siguiendo && (
                <Ionicons name="checkmark" size={16} color="#fff" style={styles.buttonIcon} />
              )}
              <Text
                style={[
                  styles.followButtonText,
                  autor.siguiendo ? styles.followingButtonText : styles.notFollowingButtonText,
                ]}
              >
                {autor.siguiendo ? "Siguiendo" : "Seguir"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

        </View>
      </View>

      <Image source={{ uri: viaje.viaje.imagen_destacada }} style={styles.imagen} />
      <View style={styles.comentarioBox}>
        <Text style={styles.comentario}>{viaje.comentario}</Text>
      </View>

      {dias.map((fecha, i) => {
        const actividades = viaje.viaje.actividades.filter((a: any) => a.fecha_realizacion === fecha)
        return (
          <View key={fecha} style={styles.dia}>
            <Text style={styles.fechaDia}>Día {i + 1}: {fechaFormateada(fecha)}</Text>
            {actividades.length === 0 ? (
              <Text style={styles.comentario}>Nada programado</Text>
            ) : (
              actividades.map((actividad: any) => (
                <View key={actividad.id} style={styles.cardHorizontal}>
                  <Image source={{ uri: actividad.url_imagen }} style={styles.cardImagen} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitulo}>{actividad.nombre}</Text>
                    <Text style={styles.cardTexto}>{actividad.ciudad}, España</Text>
                    <Text style={styles.cardTexto}>{actividad.ubicacion}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )
      })}

      <View style={{ height: 40 }} />
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
    backgroundColor: "#fff",
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
  dates: {
    fontSize: 14,
    color: "#777",
  },
  likes: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 4,
  },
  followingButton: {
    backgroundColor: "#007AFF",
  },
  notFollowingButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonIcon: {
    marginRight: 4,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  followingButtonText: {
    color: "#fff",
  },
  notFollowingButtonText: {
    color: "#007AFF",
  },
  imagen: {
    width: "100%",
    height: 200,
  },
  comentarioBox: {
    padding: 16,
    backgroundColor: "#f2f2f2",
    margin: 16,
    borderRadius: 12,
  },
  comentario: {
    fontSize: 16,
    color: "#333",
  },
  dia: {
    marginBottom: 20,
  },
  fechaDia: {
    marginLeft: 16,
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 16,
  },
  cardHorizontal: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    padding: 10,
    alignItems: "center",
  },
  cardImagen: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 10,
  },
  cardTitulo: {
    fontWeight: "bold",
    fontSize: 15,
  },
  cardTexto: {
    color: "gray",
    fontSize: 13,
  },
})

export default PantallaDetalleCompartido;
