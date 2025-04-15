import React, { useEffect, useState } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useRoute, useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const defaultAvatar = require("../assets/imagenes/user.png");

const ListaUsuarios = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { modo } = route.params as { modo: "seguidores" | "siguiendo" };
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const endpoint =
        modo === "seguidores" ? "relacion/seguidores/" : "relacion/seguimientos/";
      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (modo === "siguiendo") {
        const relaciones = res.data.map((u: any) => ({ ...u, siguiendo: true }));
        setUsuarios(relaciones);
      } else {
        const relaciones = await Promise.all(
          res.data.map(async (u: any) => {
            const estado = await api.get(`relacion/${u.id}/estado/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { ...u, siguiendo: estado.data.siguiendo };
          })
        );
        setUsuarios(relaciones);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const toggleSeguir = async (usuarioId: number, actualmenteSiguiendo: boolean) => {
    const token = await AsyncStorage.getItem("access_token");
    try {
      if (actualmenteSiguiendo) {
        await api.delete(`relacion/${usuarioId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("relacion/", { seguido: usuarioId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === usuarioId ? { ...u, siguiendo: !actualmenteSiguiendo } : u
        )
      );
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar la relación");
    }
  };

  const eliminarSeguidor = (usuarioId: number) => {
    Alert.alert(
      "Quitar seguidor",
      "¿Seguro que quieres quitar a este seguidor?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem("access_token");
            try {
              await api.delete(`relacion/${usuarioId}/eliminar_seguidor/`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchUsuarios();
            } catch (err) {
              Alert.alert("Error", "No se pudo quitar al seguidor");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchUsuarios();
  }, [modo]);

  const renderItem = ({ item }: any) => {
    const siguiendo = item.siguiendo;
    return (
      <View style={styles.itemRow}>
        <View style={styles.userInfo}>
          <Image
            source={item.foto_perfil ? { uri: item.foto_perfil } : defaultAvatar}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.username}</Text>
        </View>
        {modo === "siguiendo" ? (
          <TouchableOpacity
            style={[
              styles.seguirBtn,
              { backgroundColor: siguiendo ? "#FF5733" : "#eee" },
            ]}
            onPress={() => toggleSeguir(item.id, siguiendo)}
          >
            <Text style={{ color: siguiendo ? "white" : "black" }}>
              {siguiendo ? "Siguiendo" : "Seguir"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.eliminarBtn} onPress={() => eliminarSeguidor(item.id)}>
            <Text style={styles.eliminarText}>Quitar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#00C4CC" />;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.titulo}>{modo === "seguidores" ? "Seguidores" : "Siguiendo"}</Text>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "ios" ? 70 : 60 },
  titulo: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  backBtn: { position: "absolute", top: Platform.OS === "ios" ? 40 : 20, left: 20, zIndex: 10 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  username: { fontSize: 16, fontWeight: "500" },
  seguirBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  eliminarBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  eliminarText: { color: "red" },
});

export default ListaUsuarios;
