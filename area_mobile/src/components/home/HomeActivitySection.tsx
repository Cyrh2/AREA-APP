import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityItem } from "../../types";

interface Props {
  activity: ActivityItem[];
}

const HomeActivitySection: React.FC<Props> = ({ activity }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activité récente</Text>

      {activity.map((item) => (
        <View key={item.id} style={styles.row}>
          <Ionicons
            name={item.type === "success" ? "checkmark-circle" : "alert-circle"}
            size={18}
            color={item.type === "success" ? "#22c55e" : "#f97316"}
          />
          <View style={styles.texts}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.timeAgo}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 6,
  },
  texts: {
    flex: 1,
  },
  message: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  time: {
    color: "#6b7280",
    fontSize: 11,
  },
});

export default HomeActivitySection;
