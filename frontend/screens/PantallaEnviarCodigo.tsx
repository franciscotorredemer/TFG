import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import api from "../services/api";

interface Props {
  navigation: NavigationProp<any>;
}

const PantallaEnviarCodigo: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handleSendCode = async () => {
    try {
      await api.post("password_reset/", { email });
      Alert.alert(
        "Código enviado",
        "Revisa tu correo electrónico, incluyendo la carpeta de SPAM."
      );
      navigation.navigate("PantallaConfirmarCodigo", { email });
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el código. Verifica el correo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Introduce tu correo electrónico"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendCode}>
        <Text style={styles.buttonText}>Enviar código</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#347CAF" },
  input: { width: "100%", height: 40, borderBottomWidth: 1, borderBottomColor: "#347CAF", marginBottom: 20 },
  button: { backgroundColor: "#347CAF", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default PantallaEnviarCodigo;
