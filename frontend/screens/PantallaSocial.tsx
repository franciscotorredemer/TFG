import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
  TextInput,
  FlatList,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import api from "../services/api"
import { useNavigation } from "@react-navigation/native"

const { width } = Dimensions.get("window")
const logo = require("../assets/imagenes/logo.png")
const avatarDefault = require("../assets/imagenes/user.png")

const PantallaSocial = () => {
  const navigation = useNavigation()
  const [viajesSeguidos, setViajesSeguidos] = useState([])
  const [viajesPopulares, setViajesPopulares] = useState([])
  const [viajesRecientes, setViajesRecientes] = useState([])
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [autores, setAutores] = useState<any>({})

  const [busqueda, setBusqueda] = useState("")
  const [resultados, setResultados] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)

  const obtenerAutores = async (viajes) => {
    const token = await AsyncStorage.getItem("access_token")
    const headers = { Authorization: `Bearer ${token}` }
    const nuevosAutores = { ...autores }

    for (const viaje of viajes) {
      const id = viaje.publicado_por
      if (!nuevosAutores[id]) {
        try {
          const res = await api.get(`relacion/${id}/info/`, { headers })
          nuevosAutores[id] = res.data
        } catch (error) {
          console.error("Error al obtener autor:", error)
        }
      }
    }

    setAutores(nuevosAutores)
  }

  const obtenerViajes = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      const headers = { Authorization: `Bearer ${token}` }
      const [seguidos, populares, recientes] = await Promise.all([
        api.get("viaje_compartido/siguiendo/", { headers }),
        api.get("viaje_compartido/populares/", { headers }),
        api.get("viaje_compartido/recientes/", { headers }),
      ])
      setViajesSeguidos(seguidos.data)
      setViajesPopulares(populares.data)
      setViajesRecientes(recientes.data)

      await obtenerAutores([...seguidos.data, ...populares.data, ...recientes.data])
    } catch (error) {
      console.error("Error al obtener viajes compartidos:", error)
    } finally {
      setCargando(false)
    }
  }

  const verPantallaPerfilUsuario = async (userId: number) => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      const res = await api.get("perfil/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.id === userId) {
        navigation.navigate("Perfil")
      } else {
        navigation.navigate("PantallaPerfilUsuario", { id: userId })
      }
    } catch (error) {
      console.error("Error comprobando perfil del usuario:", error)
    }
  }
  

const [currentUserId, setCurrentUserId] = useState<number | null>(null)

const cargarPerfil = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token")
    const res = await api.get("perfil/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    setFotoUsuario(res.data.foto_perfil || null)
    setCurrentUserId(res.data.id)
  } catch (error) {
    console.error("Error al cargar perfil del usuario:", error)
  }
}

  const toggleLike = async (id: number, liked: boolean) => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      const url = liked ? `viaje_compartido/${id}/unlike/` : `viaje_compartido/${id}/like/`
      await api.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      obtenerViajes()
    } catch (error) {
      console.error("Error al togglear like:", error)
    }
  }

  const buscarUsuarios = async (text: string) => {
    setBusqueda(text)
    if (text.length < 2) {
      setResultados([])
      return
    }
    setBuscando(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const headers = { Authorization: `Bearer ${token}` }
      const res = await api.get(`/usuarios/buscar/?q=${text}`, { headers })
      setResultados(res.data)
    } catch (error) {
      console.error("Error buscando usuarios:", error)
    } finally {
      setBuscando(false)
    }
  }

  const renderUsuario = ({ item }) => (
    <TouchableOpacity style={styles.userRow} onPress={() => verPantallaPerfilUsuario(item.id)}>
      <Image source={item.foto_perfil ? { uri: item.foto_perfil } : avatarDefault} style={styles.avatar} />
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  )

  const renderViaje = (viaje) => {
    const autor = autores[viaje.publicado_por] || {}

    return (
      <TouchableOpacity
        key={viaje.id}
        style={styles.card}
        onPress={() => navigation.navigate("DetalleCompartido", { id: viaje.id })}
      >
        <Image source={{ uri: viaje.viaje.imagen_destacada }} style={styles.image} />
        <Text style={styles.titulo}>{viaje.viaje.nombre}</Text>
        <Text style={styles.descripcion} numberOfLines={2}>{viaje.comentario}</Text>
        <View style={styles.footer}>
        <TouchableOpacity onPress={() => verPantallaPerfilUsuario(viaje.publicado_por)}>
        <Image source={autor.foto_perfil ? { uri: autor.foto_perfil } : avatarDefault} style={styles.avatar} />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => {
              if (autor.id === currentUserId) {
                navigation.navigate("Perfil")
              } else {
                navigation.navigate("PantallaPerfilUsuario", { id: autor.id })
              }
            }}
          >
            <Text style={styles.username}>{autor.username || ""}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}
          onPress={() => toggleLike(viaje.id, viaje.ya_dado_like)}
        >
          <Text style={styles.likes}>{viaje.likes_count}</Text>
          <Ionicons
            name={viaje.ya_dado_like ? "heart" : "heart-outline"}
            size={22}
            color="red"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      obtenerViajes()
      cargarPerfil()
    })
    return unsubscribe
  }, [navigation])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        {/*<Image source={logo} style={styles.logo} />*/}
        <View style={styles.headerRight}>
          <Ionicons name="search-outline" style={styles.iconSearch} />
          <TextInput
            placeholder="Buscar usuarios"
            placeholderTextColor="#888"
            style={styles.inputBuscar}
            value={busqueda}
            onChangeText={buscarUsuarios}
          />
          <TouchableOpacity onPress={() => navigation.navigate("Perfil")}> 
            <Image source={fotoUsuario ? { uri: fotoUsuario } : avatarDefault} style={styles.fotoPerfil} />
          </TouchableOpacity>
        </View>
      </View>

      {busqueda.length > 1 ? (
        buscando ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Búsqueda de usuarios con "{busqueda}"</Text>
            <FlatList
              data={resultados}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUsuario}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        )
      ) : cargando ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Viajes de amigos:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {viajesSeguidos.map(renderViaje)}
          </ScrollView>

          <Text style={styles.sectionTitle}>Viajes populares:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {viajesPopulares.map(renderViaje)}
          </ScrollView>

          <Text style={styles.sectionTitle}>Viajes recientes:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {viajesRecientes.map(renderViaje)}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  logo: {
    width: 140,
    height: 40,
    resizeMode: "contain",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  iconSearch: {
    position: "absolute",
    left: 10   ,
    zIndex: 1,
    color: "#888",
    fontSize: 18,
    top: Platform.OS === "ios" ? 12 : 10,
  },
  inputBuscar: {
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 32,
    paddingRight: 12,
    marginRight: 12,
    fontSize: 14,
    color: "#333",
    width: 160,
  },
  fotoPerfil: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D1D1D6",
    justifyContent: "flex-end",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  scrollRow: {
    paddingLeft: 16,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    width: width * 0.6,
    marginRight: 14,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  titulo: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  descripcion: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  username: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginRight: 6,
  },
  likes: {
    fontSize: 14,
    color: "#333",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  resultContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
})

export default PantallaSocial
