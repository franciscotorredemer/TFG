import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { NavigationProp, useIsFocused } from "@react-navigation/native";

interface Props {
  navigation: NavigationProp<any>;
}

const PantallaEditarPerfil: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isFocused = useIsFocused();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const response = await api.get("perfil/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username);
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar tu perfil");
      }
    };

    if (isFocused) cargarPerfil();
  }, [isFocused]);

  const handleGuardar = async () => {
    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("access_token");
      const data: any = { username };
      if (password) data.password = password;

      await api.put("perfil/", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Editar perfil</Text>

      <Text style={styles.label}>Nombre de usuario</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Tu nombre de usuario"
      />

      <Text style={styles.label}>Nueva contraseña</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Deja en blanco si no quieres cambiarla"
        secureTextEntry
      />

      <Text style={styles.label}>Repite la contraseña</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repite la nueva contraseña"
        secureTextEntry
      />

      <TouchableOpacity style={styles.boton} onPress={handleGuardar}>
        <Text style={styles.textoBoton}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#347CAF",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  boton: {
    backgroundColor: "#347CAF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBoton: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PantallaEditarPerfil;
