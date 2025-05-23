import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const avatarDefault = require("../assets/imagenes/user.png")

interface Solicitud {
  id: number          // usuario id
  relacion_id: number // id de la relación (para aceptarla)
  username: string
  foto_perfil?: string
  bio?: string
}

const SolicitudesPendientes = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processingIds, setProcessingIds] = useState<number[]>([])
  const navigation = useNavigation()

  const fetchSolicitudes = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const res = await api.get("relacion/solicitudes/", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSolicitudes(res.data)
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las solicitudes")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const aceptarSolicitud = async (relacionId: number) => {
  setProcessingIds(prev => [...prev, relacionId])
  try {
    const token = await AsyncStorage.getItem("access_token")
    await api.post(`relacion/${relacionId}/aceptar/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setSolicitudes(prev => prev.filter(u => u.relacion_id !== relacionId))
  } catch {
    Alert.alert("Error", "No se pudo aceptar la solicitud")
  } finally {
    setProcessingIds(prev => prev.filter(id => id !== relacionId))
  }
}

  useEffect(() => {
    fetchSolicitudes()
  }, [])

  const renderItem = ({ item }: { item: Solicitud }) => {
    const isProcessing = processingIds.includes(item.relacion_id)

    return (
      <View style={styles.itemContainer}>
        <View style={styles.userInfo}>
          <Image source={item.foto_perfil ? { uri: item.foto_perfil } : avatarDefault} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{item.username}</Text>
            {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
          </View>
        </View>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => aceptarSolicitud(item.relacion_id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptText}>Aceptar</Text>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitudes pendientes</Text>
        <View style={{ width: 28 }} />
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.relacion_id?.toString() ?? item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchSolicitudes} />}
          ListEmptyComponent={<Text style={styles.empty}>No tienes solicitudes pendientes</Text>}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", color: "#666", marginTop: 20 },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  username: { fontWeight: "bold", fontSize: 16, color: "#333" },
  bio: { color: "#666" },
  acceptButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptText: { color: "#fff", fontWeight: "600" },
})

export default SolicitudesPendientes
