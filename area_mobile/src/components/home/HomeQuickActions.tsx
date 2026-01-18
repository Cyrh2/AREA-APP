import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onCreateArea: () => void;
  onViewTemplates: () => void;
}

const HomeQuickActions: React.FC<Props> = ({ onCreateArea, onViewTemplates }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.primaryButton} onPress={onCreateArea}>
        <Ionicons name="add-circle-outline" size={18} color="#f9fafb" />
        <Text style={styles.primaryText}>Nouveau AREA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onViewTemplates}>
        <Ionicons name="sparkles-outline" size={16} color="#e5e7eb" />
        <Text style={styles.secondaryText}>Templates</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryText: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secondaryText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
});

export default HomeQuickActions;
