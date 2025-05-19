
import type React from "react"
import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native"
import type { NavigationProp } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { FontAwesome, Ionicons } from "@expo/vector-icons"
import TarjetaViaje from "../components/TarjetaViaje"
import { LinearGradient } from "expo-linear-gradient"

import { viajesRecomendados } from "../components/ViajesRecomendados"

const logo = require("../assets/imagenes/logo.png")
const fotoPerfil = require("../assets/imagenes/user.png")
const { width } = Dimensions.get("window")

interface Viaje {
  id: number
  nombre: string
  ciudad: string
  fecha_inicio: string
  fecha_fin: string
  actividades: any[]
  imagen_destacada: string
}

interface PropsPantallaPrincipal {
  navigation: NavigationProp<any>
}

const PantallaPrincipal: React.FC<PropsPantallaPrincipal> = ({ navigation }) => {
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [cargando, setCargando] = useState(true)
  const [textoBusqueda, setTextoBusqueda] = useState("")
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null)


  const cargarViajes = async () => {
    setCargando(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const respuesta = await api.get("mis_viajes/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setViajes(respuesta.data)
    } catch (error) {
      console.error("Error al cargar los viajes:", error)
      Alert.alert("Error de conexión", "No pudimos cargar tus viajes. Por favor, intenta de nuevo más tarde.")
    } finally {
      setCargando(false)
    }
  }

  const cargarPerfil = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      const res = await api.get("perfil/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFotoUsuario(res.data.foto_perfil || null)
    } catch (error) {
      console.error("Error al cargar perfil del usuario:", error)
    }
  }
  
  

  useEffect(() => {
    const unsuscribir = navigation.addListener("focus", () => {
      cargarViajes()
      cargarPerfil()
    })
    return unsuscribir
  }, [navigation])
  

  const eliminarViaje = async (id: number) => {
    try {
      Alert.alert("Eliminar viaje", "¿Estás seguro que deseas eliminar este viaje?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem("access_token")
            await api.delete(`viajes/${id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            setViajes((prev) => prev.filter((viaje) => viaje.id !== id))
          },
        },
      ])
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el viaje.")
    }
  }

  const renderizarVacio = () => {
    return (
      <View style={estilos.estadoVacio}>
        <Ionicons name="airplane-outline" size={80} color="#ccc" />
        <Text style={estilos.tituloEstadoVacio}>No tienes viajes</Text>
        <Text style={estilos.textoEstadoVacio}>Comienza tu aventura creando un nuevo viaje</Text>
      </View>
    )
  }

  return (
    <View style={estilos.pantalla}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <Image source={logo} style={estilos.logo} />
        <View style={estilos.botonesEncabezado}>
          <TouchableOpacity style={estilos.botonIcono} onPress={() => navigation.navigate("Notificaciones")}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Perfil")} style={estilos.contenedorPerfil}>
            <Image
            source={fotoUsuario ? { uri: fotoUsuario } : fotoPerfil}
            style={estilos.fotoPerfil}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Buscador */}
      <View style={estilos.buscador}>
        <FontAwesome name="search" size={20} color="#666" style={estilos.iconoBuscar} />
        <TextInput
          style={estilos.inputBusqueda}
          placeholder="¿A dónde quieres ir?"
          placeholderTextColor="#999"
          value={textoBusqueda}
          onChangeText={setTextoBusqueda}
        />
        {textoBusqueda.length > 0 && (
          <TouchableOpacity onPress={() => setTextoBusqueda("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.scrollContenido}>
        {/* Sección de viajes */}
        <View style={estilos.filaSeccion}>
          <Text style={estilos.tituloSeccion}>Mis viajes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("MisViajes")} style={estilos.botonVerTodos}>
            <Text style={estilos.textoVerTodos}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Lista de viajes */}
        {cargando ? (
          <View style={estilos.contenedorCargando}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={estilos.textoCargando}>Cargando tus viajes...</Text>
          </View>
        ) : viajes.length === 0 ? (
          renderizarVacio()
        ) : (
          <View style={estilos.contenedorViajes}>
            {viajes.map((viaje) => (
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
                onDelete={() => eliminarViaje(viaje.id)}
              />
            ))}
          </View>
        )}

        {[...new Set(viajesRecomendados.map(v => v.categoria))].map((categoria) => (
          <View key={categoria} style={estilos.seccionInspiracion}>
            <Text style={estilos.tituloInspiracion}>{categoria}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={estilos.contenedorDestinos}
            >
              {viajesRecomendados
                .filter(v => v.categoria === categoria)
                .map((viaje, index) => (
                  <TouchableOpacity
                    key={index}
                    style={estilos.tarjetaDestino}
                    onPress={() => navigation.navigate("RecomendadoDetalle", { viajeRecomendado: viaje })}
                  >
                    <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]} style={estilos.gradienteDestino}>
                      <Text style={estilos.nombreDestino}>{viaje.nombre}</Text>
                    </LinearGradient>
                    <Image source={{ uri: viaje.imagen_destacada }} style={estilos.imagenDestino} />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        ))}


        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity style={estilos.botonFlotante} onPress={() => navigation.navigate("AñadirViaje")}> 
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  scrollContenido: {
    paddingBottom: 20,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  botonesEncabezado: {
    flexDirection: "row",
    alignItems: "center",
  },
  botonIcono: {
    padding: 8,
    marginRight: 8,
  },
  logo: {
    width: 150,
    height: 40,
    resizeMode: "contain",
  },
  contenedorPerfil: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#D1D1D6",
    overflow: "hidden",
  },
  fotoPerfil: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginHorizontal: 16,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconoBuscar: {
    marginRight: 10,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filaSeccion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 22,
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
  contenedorCargando: {
    padding: 20,
    alignItems: "center",
  },
  textoCargando: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  estadoVacio: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  tituloEstadoVacio: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  textoEstadoVacio: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  contenedorViajes: {
    paddingHorizontal: 16,
  },
  seccionInspiracion: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  tituloInspiracion: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  contenedorDestinos: {
    paddingRight: 16,
  },
  tarjetaDestino: {
    width: 160,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    position: "relative",
  },
  imagenDestino: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradienteDestino: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    zIndex: 1,
    justifyContent: "flex-end",
    padding: 10,
  },
  nombreDestino: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  botonFlotante: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
})

export default PantallaPrincipal
