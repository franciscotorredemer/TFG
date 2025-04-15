

import type React from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"

interface PropsTarjetaViaje {
  id: number
  nombre: string
  ciudad: string
  fecha_inicio: string
  fecha_fin: string
  imagen_destacada: string
  actividades: number
  onPress: () => void
  onDelete: () => void
}

const { width } = Dimensions.get("window")

const TarjetaViaje: React.FC<PropsTarjetaViaje> = ({
  id,
  nombre,
  ciudad,
  fecha_inicio,
  fecha_fin,
  imagen_destacada,
  actividades,
  onPress,
  onDelete,
}) => {
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const navegacion = useNavigation()

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const fechaInicio = formatearFecha(fecha_inicio)
  const fechaFin = formatearFecha(fecha_fin)

  const imagen = imagen_destacada
    ? { uri: imagen_destacada }
    : { uri: `https://source.unsplash.com/800x600/?${ciudad.toLowerCase()},travel` }

  return (
    <TouchableOpacity
      style={estilos.contenedor}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={estilos.tarjeta}>
        <Image source={imagen} style={estilos.imagen} />

        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
          style={estilos.degradado}
        >
          <View style={estilos.contenido}>
            <View style={estilos.filaEncabezado}>
              <Text style={estilos.titulo} numberOfLines={1}>
                {nombre}
              </Text>
              <TouchableOpacity
                style={estilos.botonOpciones}
                onPress={(e) => {
                  e.stopPropagation()
                  setMostrarOpciones(!mostrarOpciones)
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Menú de opciones */}
            {mostrarOpciones && (
              <View style={estilos.menuOpciones}>
                <TouchableOpacity
                  style={estilos.itemOpcion}
                  onPress={(e) => {
                    e.stopPropagation()
                    setMostrarOpciones(false)
                    navegacion.navigate("EditarViaje", { viajeId: id })
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#333" />
                  <Text style={estilos.textoOpcion}>Editar</Text>
                </TouchableOpacity>

                <View style={estilos.separadorOpcion} />

                <TouchableOpacity
                  style={[estilos.itemOpcion, estilos.opcionEliminar]}
                  onPress={(e) => {
                    e.stopPropagation()
                    setMostrarOpciones(false)
                    onDelete()
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  <Text style={estilos.textoEliminar}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={estilos.contenedorInfo}>
              <View style={estilos.filaInfo}>
                <Ionicons name="location-outline" size={16} color="#fff" />
                <Text style={estilos.textoInfo}>{ciudad}</Text>
              </View>

              <View style={estilos.filaInfo}>
                <Ionicons name="calendar-outline" size={16} color="#fff" />
                <Text style={estilos.textoInfo}>
                  {fechaInicio} - {fechaFin}
                </Text>
              </View>

              <View style={estilos.filaInfo}>
                <Ionicons name="list-outline" size={16} color="#fff" />
                <Text style={estilos.textoInfo}>
                  {actividades} {actividades === 1 ? "actividad" : "actividades"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  )
}

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
    width: "100%",
  },
  tarjeta: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    height: 200,
  },
  imagen: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  degradado: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    justifyContent: "flex-end",
    padding: 16,
  },
  contenido: {
    width: "100%",
  },
  filaEncabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginRight: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  botonOpciones: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  menuOpciones: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
    width: 140,
    overflow: "hidden",
  },
  itemOpcion: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  textoOpcion: {
    fontSize: 14,
    color: "#333",
  },
  opcionEliminar: {
    backgroundColor: "rgba(255, 59, 48, 0.05)",
  },
  textoEliminar: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "500",
  },
  separadorOpcion: {
    height: 1,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  contenedorInfo: {
    gap: 6,
  },
  filaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  textoInfo: {
    fontSize: 14,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
})

export default TarjetaViaje
