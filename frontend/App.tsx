import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import PantallaInicio from "./screens/PantallaInicio";
import PantallaLogin from "./screens/PantallaLogin";
import PantallaRegistro from "./screens/PantallaRegistro";
import ActivityScreen from "./screens/ActivityScreen";

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={PantallaInicio} />
        <Stack.Screen name="Login" component={PantallaLogin} />
        <Stack.Screen name="Registro" component={PantallaRegistro} />
        <Stack.Screen name="Activities" component={ActivityScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
