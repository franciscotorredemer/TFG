import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

// Imágenes
const avatarPorDefecto = require("../assets/imagenes/user.png");
const avatarBot = require("../assets/imagenes/robot.webp");

// API Key
const COHERE_API_KEY = "gJ1o89mvPVpKCQcc121pJ5nJtrz64a2IZESu0grI"; 

const enviarACohere = async (mensaje: string): Promise<string> => {
  try {
    const res = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r",
        message: mensaje,
        temperature: 0.5,
        chat_history: [],
        preamble:
          "Eres un asistente turístico llamado PlanMyJourney. Solo debes responder preguntas relacionadas con viajes, destinos, transporte, actividades turísticas, hoteles, comida local o recomendaciones de viaje. Si el usuario pregunta algo fuera de estos temas, responde educadamente que solo puedes ayudar con planificación de viajes.",
      }),
    });

    const data = await res.json();
    return data.text?.trim() || "No entendí eso.";
  } catch (error) {
    console.error("Error con Cohere:", error);
    return "Error al contactar al servidor.";
  }
};

interface Mensaje {
  id: string;
  texto: string;
  remitente: "usuario" | "bot";
}

const PantallaChatbot = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  // Cargar foto del usuario
  useEffect(() => {
    const cargarFotoUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) return;

        const res = await api.get("perfil/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFotoPerfil(res.data.foto_perfil || null);
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      }
    };

    cargarFotoUsuario();
  }, []);

  const enviarMensaje = async () => {
    if (!input.trim()) return;

    const userMessage: Mensaje = {
      id: Date.now().toString(),
      texto: input,
      remitente: "usuario",
    };

    setMensajes((prev) => [...prev, userMessage]);
    setInput("");
    setCargando(true);

    const respuestaTexto = await enviarACohere(input);
    const botMessage: Mensaje = {
      id: (Date.now() + 1).toString(),
      texto: respuestaTexto,
      remitente: "bot",
    };

    setMensajes((prev) => [...prev, botMessage]);
    setCargando(false);
  };

  const iniciarChat = (pregunta: string) => {
    setInput(pregunta);
    setTimeout(() => enviarMensaje(), 100);
  };

  const renderMensaje = ({ item }: { item: Mensaje }) => {
    const isUser = item.remitente === "usuario";
    const avatar = isUser
      ? fotoPerfil
        ? { uri: fotoPerfil }
        : avatarPorDefecto
      : avatarBot;

    return (
      <View style={[styles.mensajeWrapper, isUser ? styles.right : styles.left]}>
        {!isUser && <Image source={avatar} style={styles.avatar} />}
        <View style={[styles.mensaje, isUser ? styles.mensajeUsuario : styles.mensajeBot]}>
          <Text style={styles.textoMensaje}>{item.texto}</Text>
        </View>
        {isUser && <Image source={avatar} style={styles.avatar} />}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {mensajes.length === 0 ? (
        <View style={styles.bienvenida}>
          <Image source={avatarBot} style={styles.avatarGrande} />
          <Text style={styles.textoBienvenida}>
            ¡Hola! Soy <Text style={{ fontWeight: "bold" }}>Navi AI</Text>, tu asistente para planificar viajes. ¿En qué puedo ayudarte hoy?
          </Text>

          <View style={styles.sugerencias}>
            {["¿Qué ver en París?", "¿Dónde comer en Madrid?", "Ideas para un finde en Barcelona"].map((pregunta) => (
              <TouchableOpacity key={pregunta} style={styles.botonSugerencia} onPress={() => iniciarChat(pregunta)}>
                <Text style={styles.textoSugerencia}>{pregunta}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={[...mensajes].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderMensaje}
          contentContainerStyle={styles.lista}
          inverted
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje aquí..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.botonEnviar} onPress={enviarMensaje} disabled={cargando}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  lista: { padding: 15 },
  mensajeWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 5,
  },
  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end", alignSelf: "flex-end" },
  mensaje: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 15,
  },
  mensajeBot: {
    backgroundColor: "#f0f0f0",
    borderTopLeftRadius: 0,
    marginLeft: 8,
  },
  mensajeUsuario: {
    backgroundColor: "#347CAF",
    borderTopRightRadius: 0,
    marginRight: 8,
  },
  textoMensaje: {
    color: "#000",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  bienvenida: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  avatarGrande: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 20,
  },
  textoBienvenida: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  sugerencias: {
    gap: 10,
    width: "100%",
  },
  botonSugerencia: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  textoSugerencia: {
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default PantallaChatbot;
