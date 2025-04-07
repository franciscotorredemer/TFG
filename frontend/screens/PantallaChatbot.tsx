import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PantallaChatbot = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Pantalla  en desarrollo </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, fontWeight: "bold", color: "#333" },
});

export default PantallaChatbot;
