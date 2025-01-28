import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { ActivityScreen } from "./screens/ActivityScreen";

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;