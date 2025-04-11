import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import PantallaInicio from "./screens/PantallaInicio";
import PantallaLogin from "./screens/PantallaLogin";
import PantallaRegistro from "./screens/PantallaRegistro";
import PantallaDetalleViaje from "./screens/PantallaDetalleViaje";
import NavegacionTabs from "./navigation/NavegacionTabs";
import PantallaEditarPerfil from "./screens/PantallaEditarPerfil"; 

export type RootStackParamList = {
  Inicio: undefined;
  Login: undefined;
  Registro: undefined;
  Tabs: undefined;
  DetalleViaje: { viajeId: number };
  EditarPerfil: undefined; 
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={PantallaInicio} />
        <Stack.Screen name="Login" component={PantallaLogin} />
        <Stack.Screen name="Registro" component={PantallaRegistro} />
        <Stack.Screen name="Tabs" component={NavegacionTabs} />
        <Stack.Screen name="DetalleViaje" component={PantallaDetalleViaje} />
        <Stack.Screen name="EditarPerfil" component={PantallaEditarPerfil} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
