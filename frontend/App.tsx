import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import PantallaInicio from "./screens/PantallaInicio";
import PantallaLogin from "./screens/PantallaLogin";
import PantallaRegistro from "./screens/PantallaRegistro";
import PantallaDetalleViaje from "./screens/PantallaDetalleViaje";
import NavegacionTabs from "./navigation/NavegacionTabs";
import PantallaEditarPerfil from "./screens/PantallaEditarPerfil";
import PantallaDetalleActividad from "./screens/PantallaDetalleActividad";
import MisViajes from "./screens/MisViajes";
import PantallaPerfil from "./screens/PantallaPerfil";
import ListaUsuarios from "./screens/ListaUsuarios";
import { PantallaDetalleCompartido } from "./screens/PantallaDetalleCompartido";
import PantallaPerfilUsuario from "./screens/PantallaPerfilUsuario";
import PantallaEnviarCodigo from "./screens/PantallaEnviarCodigo";
import PantallaConfirmarCodigo from "./screens/PantallaConfirmarCodigo";

export type RootStackParamList = {
  Inicio: undefined;
  Login: undefined;
  Registro: undefined;
  Tabs: undefined;
  DetalleViaje: { viajeId: number };
  EditarPerfil: undefined;
  DetalleActividad: { actividad: any; viajeId?: number };
  MisViajes: undefined;
  Perfil: undefined;
  ListaUsuarios: { modo: "seguidores" | "siguiendo" };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={PantallaInicio} />
        <Stack.Screen name="Login" component={PantallaLogin} />
        <Stack.Screen name="Registro" component={PantallaRegistro} />
        <Stack.Screen name="Tabs" component={NavegacionTabs} options={{ gestureEnabled: false }} />
        <Stack.Screen name="DetalleViaje" component={PantallaDetalleViaje} />
        <Stack.Screen name="EditarPerfil" component={PantallaEditarPerfil} />
        <Stack.Screen name="DetalleActividad" component={PantallaDetalleActividad} />
        <Stack.Screen name="MisViajes" component={MisViajes} />
        <Stack.Screen name="Perfil" component={PantallaPerfil} />
        <Stack.Screen name="ListaUsuarios" component={ListaUsuarios} />
        <Stack.Screen name="DetalleCompartido" component={PantallaDetalleCompartido} />
        <Stack.Screen name="PantallaPerfilUsuario" component={PantallaPerfilUsuario} />
        <Stack.Screen name="PantallaEnviarCodigo" component={PantallaEnviarCodigo} />
        <Stack.Screen name="PantallaConfirmarCodigo" component={PantallaConfirmarCodigo} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
