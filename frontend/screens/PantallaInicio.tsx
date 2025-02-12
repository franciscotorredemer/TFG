import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { NavigationProp } from "@react-navigation/native";

// Guardamos aquí el logo de la aplicación
const logo = require("../assets/imagenes/logo.png");

interface PantallaInicioProps {
  navigation: NavigationProp<any>;
}

const PantallaInicio: React.FC<PantallaInicioProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />

      <Text style={styles.subtitle}>Encuentra tu plan de viaje ideal</Text>

      {/* Botón para hacer login en la aplicación */}
      <TouchableOpacity 
        style={styles.loginbutton} 
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.Textologin}>Empecemos</Text>
      </TouchableOpacity>

      {/* Para registrarse */}
      <Text style={styles.textoregistro}>
        ¿No tienes cuenta?{" "}
        <Text 
          style={styles.LinkRegistro} 
          onPress={() => navigation.navigate("Registro")}
        >
          Regístrate
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // centrar verticalmente
    alignItems: "center", // centrar horizontalmente
    padding: 20,
    backgroundColor: "#fff",
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain", // Para que se ajuste al tamaño correctamente
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#347CAF",
    fontFamily: "SourceHanSansSC",
    marginBottom: 40,
    textAlign: "center",
  },
  loginbutton: {
    width: "100%",
    height: 50,
    backgroundColor: "#347CAF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  Textologin: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "SourceHanSansSC",
  },
  textoregistro: {
    fontSize: 16,
    color: "gray",
    fontFamily: "SourceHanSansSC",
  },
  LinkRegistro: {
    color: "#347CAF",
    fontWeight: "bold",
    fontFamily: "SourceHanSansSC",
  },
});

export default PantallaInicio;
