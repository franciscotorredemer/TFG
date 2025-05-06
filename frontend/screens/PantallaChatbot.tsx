import React from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const mensajes = [
  { id: "1", texto: "¡Hola! ¿En qué puedo ayudarte?", remitente: "bot" },
  { id: "2", texto: "Quiero planear un viaje a París.", remitente: "usuario" },
  { id: "3", texto: "Perfecto, ¿cuántos días estarás?", remitente: "bot" },
];

const PantallaChatbot = () => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.mensaje, item.remitente === "usuario" ? styles.mensajeUsuario : styles.mensajeBot]}>
            <Text style={styles.textoMensaje}>{item.texto}</Text>
          </View>
        )}
        contentContainerStyle={styles.lista}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.botonEnviar}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  lista: {
    padding: 15,
  },
  mensaje: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  mensajeBot: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  mensajeUsuario: {
    alignSelf: "flex-end",
    backgroundColor: "#347CAF",
  },
  textoMensaje: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#f2f2f2",
    marginRight: 10,
  },
  botonEnviar: {
    backgroundColor: "#347CAF",
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PantallaChatbot;
