import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import PantallaInicio from "./screens/PantallaInicio";
import PantallaLogin from "./screens/PantallaLogin";
import PantallaRegistro from "./screens/PantallaRegistro";
import ActivityScreen from "./screens/ActivityScreen";
import PantallaPrincipal from "./screens/PantallaPrincipal";
import MisViajes from "./screens/MisViajes";
import PantallaDetalleViaje from "./screens/PantallaDetalleViaje";

// Definición de los tipos de parámetros para la navegación
export type RootStackParamList = {
  Inicio: undefined;
  Login: undefined;
  Registro: undefined;
  Activities: undefined;
  MisViajes: undefined;
  DetalleViaje: { viajeId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={PantallaInicio} />
        <Stack.Screen name="Login" component={PantallaLogin} />
        <Stack.Screen name="Registro" component={PantallaRegistro} />
        <Stack.Screen name="Activities" component={PantallaPrincipal} />
        <Stack.Screen name="MisViajes" component={MisViajes} />
        <Stack.Screen name="DetalleViaje" component={PantallaDetalleViaje} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
