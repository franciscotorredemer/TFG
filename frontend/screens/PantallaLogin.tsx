import React, { useState, useEffect } from "react";
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
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

// Imagenes
const logo = require("../assets/imagenes/logo.png");
const googleIcon = require("../assets/imagenes/IconoGoogle.png");
const backIcon = require("../assets/imagenes/back.png");

WebBrowser.maybeCompleteAuthSession();

interface PantallaLoginProps {
  navigation: NavigationProp<any>;
}

const PantallaLogin: React.FC<PantallaLoginProps> = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isProd = Constants.appOwnership !== "expo";


  const redirectUri = AuthSession.makeRedirectUri({
    native: "frontend://redirect",
  });
  
  console.log("🔁 redirectUri (nativo):", redirectUri);
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "301085730099-k5el9elc21h38moj9g8n91lja5i1517h.apps.googleusercontent.com",
    iosClientId: "301085730099-9bfh9sa3jotn6fu2jlrfdihmvo4aaarl.apps.googleusercontent.com",
  });
  
  
  
  

  useEffect(() => {
    console.log("🔐 Google response:", response);
  
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      console.log("✅ idToken:", idToken);
  
      if (idToken) {
        enviarTokenAGoogleLogin(idToken);
      }
    }
  }, [response]);
  

  const enviarTokenAGoogleLogin = async (accessToken: string) => {
    try {
      const res = await api.post("google-login/", {
        access_token: accessToken,
      });

      await AsyncStorage.setItem("access_token", res.data.access);
      await AsyncStorage.setItem("refresh_token", res.data.refresh);

      Alert.alert(
        "Éxito",
        res.data.created ? "Cuenta creada con Google" : "Sesión iniciada"
      );
      navigation.navigate("Tabs");
    } catch (err) {
      Alert.alert("Error", "Falló el login con Google");
    }
  };

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
      navigation.navigate("Tabs");
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
            {/* Botón para volver */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Image source={backIcon} style={styles.backIcon} />
            </TouchableOpacity>

            {/* Logo */}
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>¡Bienvenido!</Text>

            {/* Usuario */}
            <Text style={styles.parametro}>Email/usuario:</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu usuario o email"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />

            {/* Contraseña */}
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
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#347CAF"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("PantallaEnviarCodigo")}>
              <Text style={styles.forgotPassword}>
                ¿Te has olvidado la contraseña?
              </Text>
            </TouchableOpacity>
  
              {/* Botón de inicio de sesión */} 

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.Textologin}>Log in</Text>
            </TouchableOpacity>

            <Text style={styles.texto_o}>o</Text>

            {/* Google login */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => promptAsync()}
              disabled={!request}
            >
              <Image source={googleIcon} style={styles.googleIcon} />
              <Text style={styles.texto_google}>Sign in with Google</Text>
            </TouchableOpacity>

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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
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
    resizeMode: "contain",
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
    alignSelf: "flex-start",
    fontSize: 16,
    color: "#347CAF",
    fontFamily: "SourceHanSansSC",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#347CAF",
    fontSize: 16,
    fontFamily: "SourceHanSansSC",
    marginBottom: 15,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
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
