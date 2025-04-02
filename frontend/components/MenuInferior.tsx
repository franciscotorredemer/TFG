import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationProp, useNavigationState } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PropsMenuInferior {
  navigation: NavigationProp<any>;
}

const MenuInferior: React.FC<PropsMenuInferior> = ({ navigation }) => {
  const margenes = useSafeAreaInsets(); // Para respetar los bordes seguros del dispositivo
  const pantallaActual = useNavigationState((estado) => estado.routes[estado.index]?.name); // Saber en qué pantalla estamos

  // Ponemos color azul al icono activo
  const mostrarIcono = (nombre: string, ruta: string) => {
    const activo = pantallaActual === ruta;
    return (
      <FontAwesome5
        name={nombre}
        size={24}
        color={activo ? "#007AFF" : "black"}
      />
    );
  };

  return (
    <View style={[estilos.barraNavegacion, { paddingBottom: margenes.bottom }]}>
      <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
        {mostrarIcono("home", "Inicio")}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Mapa")}>
        {mostrarIcono("map-marker-alt", "Mapa")}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Explorar")}>
        {mostrarIcono("globe", "Explorar")}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Mensajes")}>
        {mostrarIcono("comment-dots", "Mensajes")}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
        {mostrarIcono("user", "Perfil")}
      </TouchableOpacity>
    </View>
  );
};

const estilos = StyleSheet.create({
  barraNavegacion: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});

export default MenuInferior;
