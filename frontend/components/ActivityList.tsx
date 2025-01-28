import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { fetchActivities } from "../services/activityService";
import type { Activity } from "../types/Activity";

export const ActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const fetchedActivities = await fetchActivities();
      setActivities(fetchedActivities);
      setLoading(false);
    } catch (err) {
      setError("Failed to load activities. Please try again later.");
      setLoading(false);
    }
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <View style={styles.activityItem}>
      <Image source={{ uri: item.url_imagen }} style={styles.activityImage} />
      <View style={styles.activityDetails}>
        <Text style={styles.activityName}>{item.nombre}</Text>
        <Text style={styles.activityDescription}>{item.descripcion}</Text>
        <Text style={styles.activityCity}>{item.ciudad}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <FlatList
      data={activities}
      renderItem={renderActivity}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  activityItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  activityDetails: {
    padding: 16,
  },
  activityName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  activityCity: {
    fontSize: 14,
    color: "#888",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});