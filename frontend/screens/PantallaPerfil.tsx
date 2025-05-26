
import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import TarjetaViaje from "../components/TarjetaViaje"
import { useIsFocused } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

const avatarPorDefecto = require("../assets/imagenes/user.png")

interface Usuario {
  nombre_usuario: string;
  correo: string;
  foto_perfil?: string;
  bio?: string;
  ubicacion?: string;
  es_google?: boolean;
}

interface Viaje {
  id: number
  nombre: string
  ciudad: string
  fecha_inicio: string
  fecha_fin: string
  imagen_destacada: string
  actividades: any[]
}

const PantallaPerfil = ({ navigation }: any) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [seguidores, setSeguidores] = useState(0)
  const [seguidos, setSeguidos] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const estaEnFoco = useIsFocused()

  const cargarDatos = async () => {
    setCargando(true)
    setError(null)

    try {
      const token = await AsyncStorage.getItem("access_token")
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
        return
      }

      const [perfilRes, viajesRes, relacionRes] = await Promise.all([
        api.get("perfil/", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("mis_viajes/", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("relacion/contador/", { headers: { Authorization: `Bearer ${token}` } }),
      ])

      setUsuario({
        nombre_usuario: perfilRes.data.username,
        correo: perfilRes.data.email,
        foto_perfil: perfilRes.data.foto_perfil,
        bio: perfilRes.data.bio,
        ubicacion: perfilRes.data.ubicacion,
        es_google: perfilRes.data.es_google, 
      });
      setViajes(viajesRes.data)
      setSeguidos(relacionRes.data.siguiendo)
      setSeguidores(relacionRes.data.seguidores)
    } catch (error) {
      console.error("Error al cargar datos del perfil:", error)
      setError("No se pudieron cargar los datos. Intenta de nuevo más tarde.")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (estaEnFoco) cargarDatos()
  }, [estaEnFoco])

  const confirmarCerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: cerrarSesion,
      },
    ])
  }

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("access_token")
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    })
  }

  const confirmarEliminarCuenta = () => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar cuenta",
          style: "destructive",
          onPress: eliminarCuenta,
        },
      ],
    )
  }

  const eliminarCuenta = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      await AsyncStorage.removeItem("access_token")
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
      try {
        await api.delete("perfil/", {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (err) {
        console.error("Error al eliminar cuenta en el servidor:", err)
      }
    } catch (error) {
      console.error("Error al eliminar cuenta:", error)
    }
  }

  const confirmarEliminarViaje = async (id: number) => {
    try {
      Alert.alert("Eliminar viaje", "¿Estás seguro que deseas eliminar este viaje?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("access_token")
              await api.delete(`viajes/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              setViajes((prev) => prev.filter((viaje) => viaje.id !== id))
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el viaje.")
            }
          },
        },
      ])
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar tu solicitud.")
    }
  }

  if (cargando) {
    return (
      <View style={estilos.contenedorCarga}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={estilos.textoCarga}>Cargando perfil...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={estilos.contenedorError}>
        <Ionicons name="cloud-offline-outline" size={80} color="#ccc" />
        <Text style={estilos.tituloError}>Error de conexión</Text>
        <Text style={estilos.textoError}>{error}</Text>
        <TouchableOpacity style={estilos.botonReintentar} onPress={cargarDatos}>
          <Text style={estilos.textoBotonReintentar}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Titulo */}
      <View style={estilos.encabezado}>
        <Text style={estilos.tituloEncabezado}>Mi Perfil</Text>
        <TouchableOpacity
          style={estilos.botonOpciones}
          onPress={() => setModalVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.scrollContenido}>
        {/* Sección de perfil */}
        <View style={estilos.seccionPerfil}>
          <View style={estilos.contenedorAvatar}>
            <Image source={usuario?.foto_perfil ? { uri: usuario.foto_perfil } : avatarPorDefecto} style={estilos.avatar} />
            {!usuario?.es_google && (
              <TouchableOpacity style={estilos.botonCamara} onPress={() => navigation.navigate("EditarPerfil")}>
                <Ionicons name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={estilos.nombreUsuario}>{usuario?.nombre_usuario}</Text>
          <Text style={estilos.correo}>{usuario?.correo}</Text>
          
          {usuario?.bio ? (
            <View style={estilos.filaInfo}>
              <Ionicons name="information-circle-outline" size={18} color="#666" style={estilos.iconoInfo} />
              <Text style={estilos.bio}>{usuario.bio}</Text>
            </View>
          ) : null}

          {usuario?.ubicacion ? (
            <View style={estilos.filaInfo}>
              <Ionicons name="location-outline" size={18} color="#666" style={estilos.iconoInfo} />
              <Text style={estilos.ubicacion}>{usuario.ubicacion}</Text>
            </View>
          ) : null}

          <View style={estilos.contenedorEstadisticas}>
            <TouchableOpacity
              style={estilos.itemEstadistica}
              onPress={() => navigation.navigate("ListaUsuarios", { modo: "siguiendo" })}
            >
              <Text style={estilos.numeroEstadistica}>{seguidos}</Text>
              <Text style={estilos.textoEstadistica}>Siguiendo</Text>
            </TouchableOpacity>

            <View style={estilos.divisorEstadistica} />

            <TouchableOpacity
              style={estilos.itemEstadistica}
              onPress={() => navigation.navigate("ListaUsuarios", { modo: "seguidores" })}
            >
              <Text style={estilos.numeroEstadistica}>{seguidores}</Text>
              <Text style={estilos.textoEstadistica}>Seguidores</Text>
            </TouchableOpacity>
          </View>

          {!usuario?.es_google && (
            <TouchableOpacity style={estilos.botonEditarPerfil} onPress={() => navigation.navigate("EditarPerfil")}>
              <Text style={estilos.textoEditarPerfil}>Editar perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sección de viajes */}
        <View style={estilos.seccionViajes}>
          <View style={estilos.encabezadoSeccion}>
            <Text style={estilos.tituloSeccion}>Mis viajes</Text>
            <TouchableOpacity onPress={() => navigation.navigate("MisViajes")}>
              <View style={estilos.botonVerTodos}>
                <Text style={estilos.textoVerTodos}>Ver todos</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </View>
            </TouchableOpacity>
          </View>

          {viajes.length === 0 ? (
            <View style={estilos.contenedorVacio}>
              <Ionicons name="airplane-outline" size={60} color="#ccc" />
              <Text style={estilos.textoVacio}>No tienes viajes</Text>
              <TouchableOpacity style={estilos.botonCrearViaje} onPress={() => navigation.navigate("AñadirViaje")}>
                <Text style={estilos.textoCrearViaje}>Crear nuevo viaje</Text>
              </TouchableOpacity>
            </View>
          ) : (
            viajes
              .slice(0, 3)
              .map((viaje) => (
                <TarjetaViaje
                  key={viaje.id}
                  id={viaje.id}
                  nombre={viaje.nombre}
                  ciudad={viaje.ciudad}
                  fecha_inicio={viaje.fecha_inicio}
                  fecha_fin={viaje.fecha_fin}
                  imagen_destacada={viaje.imagen_destacada}
                  actividades={viaje.actividades.length}
                  onPress={() => navigation.navigate("DetalleViaje", { viajeId: viaje.id })}
                  onDelete={() => confirmarEliminarViaje(viaje.id)}
                />
              ))
          )}
        </View>
      </ScrollView>

      {/* Opciones */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <Pressable style={estilos.fondoModal} onPress={() => setModalVisible(false)}>
          <View style={estilos.contenidoModal}>
            {!usuario?.es_google && (
              <>
                <TouchableOpacity
                  style={estilos.itemModal}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate("EditarPerfil");
                  }}
                >
                  <Ionicons name="person-outline" size={22} color="#333" style={estilos.iconoModal} />
                  <Text style={estilos.textoItemModal}>Editar perfil</Text>
                </TouchableOpacity>

                <View style={estilos.divisorModal} />
              </>
            )}


            <TouchableOpacity
                style={estilos.itemModal}
                onPress={() => {
                  setModalVisible(false)
                  navigation.navigate("SolicitudesPendientes")
                }}
              >
                <Ionicons name="mail-unread-outline" size={22} color="#007AFF" style={estilos.iconoModal} />
                <Text style={estilos.textoItemModal}>Solicitudes de amistad</Text>
              </TouchableOpacity>

              <View style={estilos.divisorModal} />

            <TouchableOpacity
              style={estilos.itemModal}
              onPress={() => {
                setModalVisible(false)
                confirmarCerrarSesion()
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={estilos.iconoModal} />
              <Text style={[estilos.textoItemModal, estilos.textoPeligro]}>Cerrar sesión</Text>
            </TouchableOpacity>

            <View style={estilos.divisorModal} />

            <TouchableOpacity
              style={estilos.itemModal}
              onPress={() => {
                setModalVisible(false)
                confirmarEliminarCuenta()
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" style={estilos.iconoModal} />
              <Text style={[estilos.textoItemModal, estilos.textoPeligro]}>Eliminar cuenta</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

export default PantallaPerfil

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  scrollContenido: {
    paddingBottom: 40,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  botonAtras: {
    padding: 4,
  },
  tituloEncabezado: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  botonOpciones: {
    padding: 4,
    borderRadius: 20,
  },
  seccionPerfil: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 8,
    borderBottomColor: "#f5f5f5",
  },
  contenedorAvatar: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  botonCamara: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  nombreUsuario: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  correo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  contenedorEstadisticas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 24,
  },
  itemEstadistica: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  numeroEstadistica: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  textoEstadistica: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  divisorEstadistica: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
  },
  botonEditarPerfil: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  textoEditarPerfil: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
  seccionViajes: {
    padding: 16,
  },
  encabezadoSeccion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  botonVerTodos: {
    flexDirection: "row",
    alignItems: "center",
  },
  textoVerTodos: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 4,
  },
  contenedorVacio: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  textoVacio: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 16,
  },
  botonCrearViaje: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoCrearViaje: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  contenidoModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  itemModal: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  iconoModal: {
    marginRight: 16,
    width: 24,
  },
  textoItemModal: {
    fontSize: 18,
    color: "#333",
  },
  divisorModal: {
    height: 1,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  textoPeligro: {
    color: "#FF3B30",
  },
  contenedorCarga: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  textoCarga: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  contenedorError: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  tituloError: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  textoError: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  botonReintentar: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBotonReintentar: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  filaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  iconoInfo: {
    marginRight: 6,
  },
  bio: {
    fontSize: 15,
    color: "#444",
    fontStyle: "italic",
    textAlign: "left",
    flexShrink: 1,
  },
  ubicacion: {
    fontSize: 15,
    color: "#666",
    textAlign: "left",
    flexShrink: 1,
  },
})
