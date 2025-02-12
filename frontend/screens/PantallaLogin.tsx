import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import axios from "axios";
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons"; 
import api from "../services/api";

// Importamos las imagenes de los logos e iconos
const logo = require("../assets/imagenes/logo.png");
const googleIcon = require("../assets/imagenes/IconoGoogle.png");
const backIcon = require("../assets/imagenes/back.png");

interface PantallaLoginProps {
  navigation: NavigationProp<any>;
}

const PantallaLogin: React.FC<PantallaLoginProps> = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await api.post("token/", {
        username,
        password,
      });

      const { access, refresh } = response.data;
      await AsyncStorage.setItem("access_token", access);
      await AsyncStorage.setItem("refresh_token", refresh);

      Alert.alert("Login exitoso", "Has iniciado sesión correctamente");
      navigation.navigate("Activities");
    } catch (error) {
      Alert.alert("Error", "Credenciales incorrectas o problema con el servidor");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Botón para volver a la pantalla anterior */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image source={backIcon} style={styles.backIcon} />
            </TouchableOpacity>
          
            {/* Logo de la aplicación */}
            <Image source={logo} style={styles.logo} />



            <Text style={styles.title}>¡Bienvenido!</Text>

            {/* Campo de nombre de usuario o email */}
            <Text style={styles.parametro}>Email/usuario:</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu usuario o email"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />

            {/* Campo de contraseña */}
            <Text style={styles.parametro}>Contraseña:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Introduce tu contraseña"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#347CAF" />
              </TouchableOpacity>
            </View>

            {/* Recuperar la contraseña */}
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>¿Te has olvidado la contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.Textologin}>Log in</Text>
            </TouchableOpacity>

            <Text style={styles.texto_o}>o</Text>

            {/* Botón de  inciar sesión con Google */}
            <TouchableOpacity style={styles.googleButton}>
              <Image source={googleIcon} style={styles.googleIcon} />
              <Text style={styles.texto_google}>Sign in with Google</Text>
            </TouchableOpacity>
            
            {/* Para registrarse */}
            <Text style={styles.textoregistro}>
              ¿No tienes cuenta?{" "}
              <Text 
                style={styles.LinkRegistro} 
                onPress={() => navigation.navigate("Registro")}
              >
                Regístrate!
              </Text>
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center", // centrar verticalmente
    alignItems: "center", // centrar horizontalmente
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute", // para que este por encima de los demás elementos
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain", // para que se ajuste al tamaño correctamente
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#347CAF",
    fontFamily: "SourceHanSansSC",
    marginBottom: 20,
    textAlign: "center",
  },
  parametro: {
    alignSelf: "flex-start", // para que estén a la izquierda
    fontSize: 16,
    color: "#347CAF",
    fontFamily: "SourceHanSansSC",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 40,
    borderBottomWidth: 1, // línea de abajo
    borderBottomColor: "#347CAF",
    fontSize: 16,
    fontFamily: "SourceHanSansSC",
    marginBottom: 15,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row", // para que el icono esté al lado del input
    alignItems: "center", // aseguramos que estén alineados
    borderBottomWidth: 1, 
    borderBottomColor: "#347CAF",
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: "SourceHanSansSC",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#347CAF",
    fontSize: 14,
    fontFamily: "SourceHanSansSC",
    marginBottom: 20,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#347CAF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  Textologin: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  texto_o: {
    fontSize: 16,
    color: "#aaa",
    marginVertical: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "center",
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  texto_google: {
    fontSize: 16,
    color: "#347CAF",
    fontFamily: "SourceHanSansSC",
  },
  textoregistro: {
    fontSize: 16,
    color: "#333",
  },
  LinkRegistro: {
    color: "#347CAF",
    fontWeight: "bold",
  },
});

export default PantallaLogin;
