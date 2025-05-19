
import type React from "react"
import { useState, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { type NavigationProp, useFocusEffect } from "@react-navigation/native"
import TarjetaViaje from "../components/TarjetaViaje"
import { Ionicons } from "@expo/vector-icons"

interface Viaje {
  id: number
  nombre: string
  ciudad: string
  fecha_inicio: string
  fecha_fin: string
  imagen_destacada: string
  actividades: any[]
}

interface Props {
  navigation: NavigationProp<any>
}

const MisViajes: React.FC<Props> = ({ navigation }) => {
  const [listaViajes, setListaViajes] = useState<Viaje[]>([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const obtenerViajes = async (mostrarCargando = true) => {
    if (mostrarCargando) setCargando(true)
    setMensajeError(null)

    try {
      const token = await AsyncStorage.getItem("access_token")
      const respuesta = await api.get("viajes/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setListaViajes(respuesta.data)
    } catch (error) {
      console.error("Error al cargar los viajes:", error)
      setMensajeError("No se pudieron cargar los viajes. Intenta de nuevo más tarde.")
    } finally {
      setCargando(false)
      setActualizando(false)
    }
  }

  const borrarViaje = async (viajeId: number) => {
    try {
      Alert.alert("Eliminar viaje", "¿Estás seguro que deseas eliminar este viaje?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("access_token")
              await api.delete(`viajes/${viajeId}/`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              setListaViajes((prev) => prev.filter((v) => v.id !== viajeId))
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

  // Refresca la lista cuando la pantalla toma foco
  useFocusEffect(
    useCallback(() => {
      obtenerViajes()
    }, []),
  )

  const alRefrescar = () => {
    setActualizando(true)
    obtenerViajes(false)
  }

  const renderizarVacio = () => {
    if (mensajeError) {
      return (
        <View style={estilos.contenedorVacio}>
          <Ionicons name="cloud-offline-outline" size={80} color="#ccc" />
          <Text style={estilos.tituloVacio}>Error de conexión</Text>
          <Text style={estilos.textoVacio}>{mensajeError}</Text>
          <TouchableOpacity style={estilos.botonReintentar} onPress={() => obtenerViajes()}>
            <Text style={estilos.textoBotonReintentar}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={estilos.contenedorVacio}>
        <Ionicons name="airplane-outline" size={80} color="#ccc" />
        <Text style={estilos.tituloVacio}>No tienes viajes</Text>
        <Text style={estilos.textoVacio}>Comienza tu aventura creando un nuevo viaje</Text>
        <TouchableOpacity style={estilos.botonCrear} onPress={() => navigation.navigate("NuevoViaje")}>
          <Text style={estilos.textoBotonCrear}>Crear nuevo viaje</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderizarItem = ({ item }: { item: Viaje }) => (
    <TarjetaViaje
      id={item.id}
      nombre={item.nombre}
      ciudad={item.ciudad}
      fecha_inicio={item.fecha_inicio}
      fecha_fin={item.fecha_fin}
      imagen_destacada={item.imagen_destacada}
      actividades={item.actividades?.length || 0}
      onPress={() => navigation.navigate("DetalleViaje", { viajeId: item.id })}
      onDelete={() => borrarViaje(item.id)}
    />
  )

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={estilos.botonVolver}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={estilos.tituloEncabezado}>Mis Viajes</Text>
        <TouchableOpacity style={estilos.botonAgregar} onPress={() => navigation.navigate("NuevoViaje")}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={estilos.contenedorCargando}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={estilos.textoCargando}>Cargando tus viajes...</Text>
        </View>
      ) : (
        <FlatList
          data={listaViajes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderizarItem}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={alRefrescar}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={renderizarVacio}
        />
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
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
  botonVolver: {
    padding: 4,
  },
  tituloEncabezado: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  botonAgregar: {
    padding: 4,
  },
  lista: {
    padding: 16,
    paddingBottom: 80,
  },
  contenedorCargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  textoCargando: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 400,
  },
  tituloVacio: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  textoVacio: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  botonCrear: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBotonCrear: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  botonReintentar: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  textoBotonReintentar: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default MisViajes
