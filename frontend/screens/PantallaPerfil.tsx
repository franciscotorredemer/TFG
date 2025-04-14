import React, { useEffect, useState } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import TarjetaViaje from "../components/TarjetaViaje";
import { useIsFocused } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const defaultAvatar = require("../assets/imagenes/user.png");
const cameraIcon = require("../assets/imagenes/camara.png");

interface Usuario {
  username: string;
  email: string;
  foto_perfil?: string;
}

const PantallaPerfil = ({ navigation }: any) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [viajes, setViajes] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const cargarDatos = async () => {
      const token = await AsyncStorage.getItem("access_token");
      try {
        const perfilRes = await api.get("perfil/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(perfilRes.data);

        const viajesRes = await api.get("mis_viajes/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setViajes(viajesRes.data);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los datos");
      }
    };

    if (isFocused) cargarDatos();
  }, [isFocused]);

  const confirmarCerrarSesion = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: cerrarSesion,
        },
      ]
    );
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("access_token");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

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
      ]
    );
  };

  const eliminarCuenta = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await api.delete("perfil/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.removeItem("access_token");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar la cuenta");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.titulo}>Mi perfil</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <FontAwesome name="ellipsis-v" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalMenu}>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              navigation.navigate("EditarPerfil");
            }}>
              <Text style={styles.modalItem}>Editar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              confirmarCerrarSesion();
            }}>
              <Text style={[styles.modalItem, { color: "red" }]}>Cerrar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              confirmarEliminarCuenta();
            }}>
              <Text style={[styles.modalItem, { color: "red" }]}>Eliminar cuenta</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={usuario?.foto_perfil ? { uri: usuario.foto_perfil } : defaultAvatar}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.cameraIcon}>
          <Image source={cameraIcon} style={styles.cameraImage} />
        </TouchableOpacity>
      </View>

      {/* Datos */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>User name</Text>
        <Text style={styles.info}>{usuario?.username}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.info}>{usuario?.email}</Text>
      </View>

      {/* Sección viajes */}
      <View style={styles.viajesHeader}>
        <Text style={styles.titulo}>Mis viajes</Text>
        <TouchableOpacity onPress={() => navigation.navigate("MisViajes")}>
          <Text style={styles.verTodos}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {viajes.map((viaje) => (
        <TarjetaViaje
          key={viaje.id}
          nombre={viaje.nombre}
          ciudad={viaje.ciudad}
          fecha_inicio={viaje.fecha_inicio}
          fecha_fin={viaje.fecha_fin}
          imagen_destacada={viaje.imagen_destacada}
          actividades={viaje.actividades.length}
          onPress={() => navigation.navigate("DetalleViaje", { viajeId: viaje.id })}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    left: "55%",
    transform: [{ translateX: -18 }],
    padding: 8,
    backgroundColor: "#00C4CC",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  cameraImage: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  label: {
    color: "lightgray",
    fontSize: 14,
  },
  info: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  viajesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  verTodos: {
    color: "#00C4CC",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalMenu: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalItem: {
    fontSize: 18,
    paddingVertical: 12,
  },
});

export default PantallaPerfil;
