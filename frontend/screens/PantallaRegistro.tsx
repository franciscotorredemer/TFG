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
import axios from "axios";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; 
import api from "../services/api";

// Importamos las imagenes de los logos e iconos
const logo = require("../assets/imagenes/logo.png");
const backIcon = require("../assets/imagenes/back.png");

interface PantallaRegistroProps {
  navigation: NavigationProp<any>;
}

const PantallaRegistro: React.FC<PantallaRegistroProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await api.post("register/", {
        email,
        username,
        password,
      });

      Alert.alert("Registro correcto", "Tu cuenta ha sido creada.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", "Ha habido un problema con el registro.");
    }
  };

  return (
    // evitamos que el teclado tape el formulario
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      {/* Para cerrar el teclado al pulsar fuera */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Flecha para volver atrás */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image source={backIcon} style={styles.backIcon} />
            </TouchableOpacity>

            {/* Logo */}
            <Image source={logo} style={styles.logo} />

            
            <Text style={styles.title}>¡Regístrate!</Text>

            {/* Campos de email*/}
            <Text style={styles.parametro}>Email:</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
            />

            {/* Campo de nombre de usuario */}
            <Text style={styles.parametro}>Nombre de usuario:</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu nombre de usuario"
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
                secureTextEntry={!showPassword} // Para ver o no la contraseña
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#347CAF" />
              </TouchableOpacity>
            </View>


            {/* Campo de repetir contraseña */}
            <Text style={styles.parametro}>Repetir contraseña:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#aaa"
                secureTextEntry={!showConfirmPassword} // Para ver o no la contraseña
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#347CAF" />
              </TouchableOpacity>
            </View>

            {/* Botón Crear Cuenta */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.textoregistro}>Crear cuenta</Text>
            </TouchableOpacity>

            {/* Volver al Login */}
            <Text style={styles.Textologin}>
              ¿Ya tienes cuenta?{" "}
              <Text 
                style={styles.loginLink} 
                onPress={() => navigation.navigate("Login")}
              >
                Log in
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
    flex: 1, // toda la pantalla
  },
  scrollContainer: {
    flexGrow: 1, //toda la pantalla
  },
  container: {
    flex: 1,
    justifyContent: "center", // Para centrar el contenido verticalmente
    alignItems: "center", // Para centrar el contenido horizontalmente
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute", // Para que esté por encima de los demás elementos
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
    resizeMode: "contain", // Para que se ajuste al tamaño correctamente
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
    alignSelf: "flex-start", // Para que estén a la izquierda
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
    flexDirection: "row", // Para que el icono esté al lado del input
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
  registerButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#347CAF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  textoregistro: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "SourceHanSansSC",
  },
  Textologin: {
    fontSize: 16,
    color: "gray",
    fontFamily: "SourceHanSansSC",
  },
  loginLink: {
    color: "#347CAF",
    fontWeight: "bold",
    fontFamily: "SourceHanSansSC",
  },
});

export default PantallaRegistro;
