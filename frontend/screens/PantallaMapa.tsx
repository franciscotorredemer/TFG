"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import { View, Text, StyleSheet, ScrollView, Switch, Image, TouchableOpacity, Animated } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useFocusEffect } from "@react-navigation/native"
import api from "../services/api"

interface Actividad {
  id: number
  nombre: string
  direccion?: string
  url_imagen?: string
  latitud: number
  longitud: number
  visible?: boolean
}

interface Hotel {
  id: number
  nombre: string
  direccion?: string
  imagen?: string
  latitud: number
  longitud: number
}

interface Estancia {
  hotel: Hotel
  visible?: boolean
}

interface Viaje {
  id: number
  nombre: string
  actividades: Actividad[]
  estancias: Estancia[]
  visible: boolean
}

function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const PantallaMapa = () => {
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [ubicacion, setUbicacion] = useState<{ latitude: number; longitude: number } | null>(null)
  const [panelAbierto, setPanelAbierto] = useState(true)
  const [seccionesAbiertas, setSeccionesAbiertas] = useState<{ [viajeId: number]: boolean }>({})
  const [selectedMarker, setSelectedMarker] = useState<any>(null)
  const mapRef = useRef<MapView>(null)

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") return
    const location = await Location.getCurrentPositionAsync({})
    setUbicacion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })
  }

  const fetchViajes = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token")
      const res = await api.get("viajes/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = res.data.map((v: any) => ({
        ...v,
        visible: false,
        actividades: v.actividades.map((a: any) => ({ ...a, visible: false })),
        estancias: v.estancias.map((e: any) => ({ ...e, visible: false })),
      }))
      setViajes(data)
    } catch (err) {
      console.error("Error cargando viajes:", err)
    }
  }

  useEffect(() => {
    obtenerUbicacion()
    fetchViajes()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchViajes()
    }, []),
  )

  const toggleActividadVisible = (viajeId: number, actividadId: number, lat: number, lng: number) => {
    setViajes((prev) =>
      prev.map((v) => {
        if (v.id !== viajeId) return v
        return {
          ...v,
          actividades: v.actividades.map((a) => (a.id === actividadId ? { ...a, visible: !a.visible } : a)),
        }
      }),
    )
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  }

  const toggleEstanciaVisible = (viajeId: number, hotelId: number, lat: number, lng: number) => {
    setViajes((prev) =>
      prev.map((v) => {
        if (v.id !== viajeId) return v
        return {
          ...v,
          estancias: v.estancias.map((e) => (e.hotel.id === hotelId ? { ...e, visible: !e.visible } : e)),
        }
      }),
    )
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  }

  const toggleSeccion = (viajeId: number) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [viajeId]: !prev[viajeId] }))
  }

  const ocultarTodos = () => {
    setViajes((prev) =>
      prev.map((v) => ({
        ...v,
        actividades: v.actividades.map((a) => ({ ...a, visible: false })),
        estancias: v.estancias.map((e) => ({ ...e, visible: false })),
      })),
    )
  }

  const handleMarkerPress = (marker: any) => {
    setSelectedMarker(marker)
  }

  const marcadoresVisibles = useMemo(
    () =>
      viajes.flatMap((v) => [
        ...v.actividades
          .filter((a) => a.visible && a.latitud && a.longitud)
          .map((a) => ({
            id: `actividad-${a.id}`,
            nombre: a.nombre,
            direccion: a.direccion,
            imagen: a.url_imagen,
            latitud: a.latitud,
            longitud: a.longitud,
            tipo: "actividad",
          })),
        ...v.estancias
          .filter((e) => e.visible && e.hotel.latitud && e.hotel.longitud)
          .map((e) => ({
            id: `hotel-${e.hotel.id}`,
            nombre: e.hotel.nombre,
            direccion: e.hotel.direccion,
            imagen: e.hotel.imagen,
            latitud: e.hotel.latitud,
            longitud: e.hotel.longitud,
            tipo: "hotel",
          })),
      ]),
    [viajes],
  )

  // Componente personalizado para mostrar detalles del marcador
  const MarkerDetailCard = () => {
    if (!selectedMarker) return null

    return (
      <View style={styles.markerDetailCard}>
        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedMarker(null)}>
          <Ionicons name="close" size={24} color="#347CAF" />
        </TouchableOpacity>

        {selectedMarker.imagen && (
          <Image source={{ uri: selectedMarker.imagen }} style={styles.markerImage} resizeMode="cover" />
        )}

        <Text style={styles.markerTitle}>{selectedMarker.nombre}</Text>
        {selectedMarker.direccion && <Text style={styles.markerAddress}>{selectedMarker.direccion}</Text>}

        {ubicacion && (
          <Text style={styles.markerDistance}>
            A{" "}
            {calcularDistanciaKm(
              ubicacion.latitude,
              ubicacion.longitude,
              selectedMarker.latitud,
              selectedMarker.longitud,
            ).toFixed(1)}{" "}
            km de tu ubicación
          </Text>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.mapa}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: ubicacion?.latitude || 40.4168,
          longitude: ubicacion?.longitude || -3.7038,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        showsUserLocation
      >
        {marcadoresVisibles.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitud, longitude: m.longitud }}
            title={m.nombre}
            pinColor={m.tipo === "hotel" ? "blue" : "red"}
            onPress={() => handleMarkerPress(m)}
          />
        ))}
      </MapView>

      {/* Mostrar detalles del marcador seleccionado */}
      {selectedMarker && <MarkerDetailCard />}

      <Animated.View style={[styles.panel, { height: panelAbierto ? 300 : 50 }]}>
        <TouchableOpacity onPress={() => setPanelAbierto(!panelAbierto)} style={styles.panelToggle}>
          <Ionicons name={panelAbierto ? "chevron-down" : "chevron-up"} size={24} color="#347CAF" />
        </TouchableOpacity>

        {panelAbierto && (
          <ScrollView style={styles.lista}>
            <TouchableOpacity onPress={ocultarTodos} style={styles.ocultarBtn}>
              <Text style={styles.ocultarTxt}>Ocultar todos</Text>
            </TouchableOpacity>

            {viajes.map((viaje) => (
              <View key={viaje.id} style={styles.viajeContainer}>
                <TouchableOpacity onPress={() => toggleSeccion(viaje.id)} style={styles.viajeHeader}>
                  <Text style={styles.viajeNombre}>{viaje.nombre}</Text>
                  <Ionicons
                    name={seccionesAbiertas[viaje.id] ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#347CAF"
                  />
                </TouchableOpacity>

                {seccionesAbiertas[viaje.id] && (
                  <>
                    {viaje.actividades.map((a) => (
                      <View key={`actividad-${viaje.id}-${a.id}`} style={styles.itemRow}>
                        <Ionicons name="walk-outline" size={16} color="#347CAF" style={styles.icon} />
                        <Text style={styles.item}>{a.nombre}</Text>
                        <Switch
                          value={a.visible || false}
                          onValueChange={() => toggleActividadVisible(viaje.id, a.id, a.latitud, a.longitud)}
                        />
                      </View>
                    ))}

                    {viaje.estancias.map((e, index) => (
                      <View key={`estancia-${viaje.id}-${e.hotel.id}-${index}`} style={styles.itemRow}>
                        <FontAwesome5 name="hotel" size={16} color="#347CAF" style={styles.icon} />
                        <Text style={styles.item}>{e.hotel.nombre}</Text>
                        <Switch
                          value={e.visible || false}
                          onValueChange={() =>
                            toggleEstanciaVisible(viaje.id, e.hotel.id, e.hotel.latitud, e.hotel.longitud)
                          }
                        />
                      </View>
                    ))}
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapa: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },
  panelToggle: {
    alignItems: "center",
    paddingVertical: 8,
  },
  lista: {
    paddingHorizontal: 10,
  },
  viajeContainer: {
    marginBottom: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  viajeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viajeNombre: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  icon: {
    marginRight: 6,
  },
  item: {
    flex: 1,
    color: "#555",
  },
  ocultarBtn: {
    alignSelf: "flex-end",
    marginVertical: 5,
    marginRight: 5,
  },
  ocultarTxt: {
    color: "#347CAF",
    fontWeight: "bold",
  },
  // Estilos para la tarjeta de detalles del marcador
  markerDetailCard: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
  position: "absolute",
  top: 10,
  right: 10,
  zIndex: 2,
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 6,
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
},
  markerImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  markerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  markerAddress: {
    color: "#555",
    marginBottom: 5,
  },
  markerDistance: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
  },
})

export default PantallaMapa
