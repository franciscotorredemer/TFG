
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  TextInput,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

const defaultAvatar = require("../assets/imagenes/user.png")
const { width } = Dimensions.get("window")

interface Usuario {
  id: number
  username: string
  foto_perfil?: string
  estado?: "pendiente" | "aceptada" | null
  bio?: string
}

const ListaUsuarios = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { modo } = route.params as { modo: "seguidores" | "siguiendo" }

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<number[]>([])

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const fetchUsuarios = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const token = await AsyncStorage.getItem("access_token")
      if (!token) {
        navigation.navigate("Login")
        return
      }

      const endpoint = modo === "seguidores" ? "relacion/seguidores/" : "relacion/seguimientos/"
      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const usuariosData: Usuario[] = await Promise.all(
        res.data.map(async (u: any) => {
          try {
            const estado = await api.get(`relacion/${u.id}/estado/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            return { ...u, estado: estado.data.estado as "pendiente" | "aceptada" | null }
          } catch {
            return { ...u, estado: null }
          }
        })
      )


      setUsuarios(usuariosData)
      setFilteredUsuarios(usuariosData)

      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      setError("No se pudo cargar la lista de usuarios. Intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const actualizarEstado = (id: number, estado: "pendiente" | "aceptada" | null) => {
      const update = (list: Usuario[]) => list.map(u => u.id === id ? { ...u, estado } : u)
      setUsuarios(update)
      setFilteredUsuarios(update)
    }


  const toggleSeguir = async (usuarioId: number, estadoActual: "pendiente" | "aceptada" | null) => {
    
    setProcessingIds((prev) => [...prev, usuarioId])

    try {
      const token = await AsyncStorage.getItem("access_token")
      if (!token) {
        navigation.navigate("Login")
        return
      }

      if (estadoActual === "aceptada" || estadoActual === "pendiente") {
        await api.delete(`relacion/${usuarioId}/`, { headers: { Authorization: `Bearer ${token}` } })
        actualizarEstado(usuarioId, null)
      } else {
        await api.post("relacion/", { seguido: usuarioId }, { headers: { Authorization: `Bearer ${token}` } })
        actualizarEstado(usuarioId, "pendiente")
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar la relación.")
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== usuarioId))
    }

  }

  const eliminarSeguidor = (usuario: Usuario) => {
    Alert.alert("Quitar seguidor", `¿Seguro que quieres quitar a ${usuario.username} de tus seguidores?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: async () => {
          setProcessingIds((prev) => [...prev, usuario.id])

          try {
            const token = await AsyncStorage.getItem("access_token")
            await api.delete(`relacion/${usuario.id}/eliminar_seguidor/`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            // borramos al usuaario de las listas
            const filterUser = (list: Usuario[]) => list.filter((u) => u.id !== usuario.id)
            setUsuarios(filterUser)
            setFilteredUsuarios(filterUser)
          } catch (err) {
            console.error("Error al quitar seguidor:", err)
            Alert.alert("Error", "No se pudo quitar al seguidor")
          } finally {
            setProcessingIds((prev) => prev.filter((id) => id !== usuario.id))
          }
        },
      },
    ])
  }

  const handleSearch = (text: string) => {
    setSearchQuery(text)

    if (text.trim() === "") {
      setFilteredUsuarios(usuarios)
    } else {
      const filtered = usuarios.filter((user) => user.username.toLowerCase().includes(text.toLowerCase()))
      setFilteredUsuarios(filtered)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchUsuarios(false)
  }

  const viewProfile = (usuario: Usuario) => {
    navigation.navigate("PantallaPerfilUsuario", { id: usuario.id })
  }

  useEffect(() => {
    fetchUsuarios()
  }, [modo])

  const renderEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Error de conexión</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchUsuarios()}>
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (searchQuery && filteredUsuarios.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptyText}>No se encontraron usuarios que coincidan con "{searchQuery}"</Text>
        </View>
      )
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>{modo === "seguidores" ? "No tienes seguidores" : "No sigues a nadie"}</Text>
        <Text style={styles.emptyText}>
          {modo === "seguidores" ? "Cuando alguien te siga, aparecerá aquí" : "Cuando sigas a alguien, aparecerá aquí"}
        </Text>
      </View>
    )
  }

  const renderItem = ({ item, index }: { item: Usuario; index: number }) => {
    const isProcessing = processingIds.includes(item.id)
    const estado = item.estado
    

    // Aqui usamos esto para hacer una animacion segun el tiempo
    const animationDelay = index * 100

    return (
      <Animated.View
        style={[
          styles.itemContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.itemRow} onPress={() => viewProfile(item)}>
          <View style={styles.userInfo}>
            <Image source={item.foto_perfil ? { uri: item.foto_perfil } : defaultAvatar} style={styles.avatar} />
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>{item.username}</Text>
              {item.bio && (
                <Text style={styles.userBio} numberOfLines={1}>
                  {item.bio}
                </Text>
              )}
            </View>
          </View>

          {modo === "siguiendo" ? (
            <TouchableOpacity
              style={[
                styles.followButton,
                estado === "aceptada" ? styles.followingButton : styles.notFollowingButton,
                isProcessing && styles.processingButton,
              ]}
              onPress={() => toggleSeguir(item.id, estado)}
              disabled={isProcessing || estado === "pendiente"}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={estado === "aceptada" ? "#fff" : "#007AFF"} />
              ) : (
                <Text style={[
                  styles.followButtonText,
                  estado === "aceptada" ? styles.followingButtonText : styles.notFollowingButtonText,
                ]}>
                  {estado === "pendiente" ? "Pendiente" : estado === "aceptada" ? "Siguiendo" : "Seguir"}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.removeButton, isProcessing && styles.processingButton]}
              onPress={() => eliminarSeguidor(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Text style={styles.removeButtonText}>Quitar</Text>
              )}
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{modo === "seguidores" ? "Seguidores" : "Siguiendo"}</Text>
        <View style={{ width: 28 }} />
      </View>

     
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Buscar ${modo === "seguidores" ? "seguidores" : "usuarios"}`}
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando {modo === "seguidores" ? "seguidores" : "usuarios"}...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007AFF"]} tintColor="#007AFF" />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemContainer: {
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userTextContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userBio: {
    fontSize: 14,
    color: "#666",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: "center",
  },
  followingButton: {
    backgroundColor: "#007AFF",
  },
  notFollowingButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  processingButton: {
    opacity: 0.7,
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
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    minWidth: 80,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default ListaUsuarios
