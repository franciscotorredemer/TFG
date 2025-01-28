import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ActivityList } from "../components/ActivityList";

export const ActivityScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividades</Text>
      <ActivityList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});