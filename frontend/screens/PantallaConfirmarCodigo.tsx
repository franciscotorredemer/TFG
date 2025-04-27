import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { RouteProp, useRoute, NavigationProp } from "@react-navigation/native";
import api from "../services/api";

interface Props {
  navigation: NavigationProp<any>;
}

const PantallaConfirmarCodigo: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<RouteProp<any>>();
  const { email } = route.params;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const handleConfirm = async () => {
    try {
      await api.post("password_reset_confirm/", { email, code, password });
      Alert.alert("Éxito", "Contraseña actualizada. ¡Ahora inicia sesión!");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", "Código incorrecto o expirado. Verifica e intenta de nuevo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirma el código</Text>
      <TextInput
        style={styles.input}
        placeholder="Código recibido por email"
        placeholderTextColor="#aaa"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirmar cambio</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#347CAF", textAlign: "center" },
  input: { width: "100%", height: 40, borderBottomWidth: 1, borderBottomColor: "#347CAF", marginBottom: 20 },
  button: { backgroundColor: "#347CAF", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default PantallaConfirmarCodigo;
