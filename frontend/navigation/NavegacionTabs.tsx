import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, FontAwesome5, Entypo, MaterialIcons } from "@expo/vector-icons";

import PantallaPrincipal from "../screens/PantallaPrincipal";
import PantallaMapa from "../screens/PantallaMapa";
import PantallaSocial from "../screens/PantallaSocial";
import PantallaChatbot from "../screens/PantallaChatbot";
import PantallaPerfil from "../screens/PantallaPerfil";

export type RootTabParamList = {
  Inicio: undefined;
  Mapa: undefined;
  Social: undefined;
  Chat: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const NavegacionTabs = () => (
  <Tab.Navigator
    initialRouteName="Inicio"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#007AFF",
      tabBarInactiveTintColor: "gray",
      tabBarIcon: ({ color, size }) => {
        switch (route.name) {
          case "Inicio":
            return <Ionicons name="home" size={size} color={color} />;
          case "Mapa":
            return <Entypo name="map" size={size} color={color} />;
          case "Social":
            return <FontAwesome5 name="globe" size={size} color={color} />;
          case "Chat":
            return <Ionicons name="chatbubbles" size={size} color={color} />;
          case "Perfil":
            return <MaterialIcons name="person" size={size} color={color} />;
          default:
            return null;
        }
      },
    })}
  >
    <Tab.Screen name="Inicio" component={PantallaPrincipal} />
    <Tab.Screen name="Mapa" component={PantallaMapa} />
    <Tab.Screen name="Social" component={PantallaSocial} />
    <Tab.Screen name="Chat" component={PantallaChatbot} />
    <Tab.Screen name="Perfil" component={PantallaPerfil} />
  </Tab.Navigator>
);

export default NavegacionTabs;
