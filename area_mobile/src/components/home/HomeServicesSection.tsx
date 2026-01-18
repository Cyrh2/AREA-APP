import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Service } from "../../types";

interface Props {
  services: Service[];
  onAddService: () => void;
}

// Fonction helper pour obtenir l'icône appropriée selon le service
const getServiceIcon = (service: Service) => {
  const connected = !!service.connected;
  const color = connected ? "#22c55e" : "#9ca3af";
  const size = 32;

  // Use slug if available, otherwise name, safely handle id
  const identifier = (service.slug || service.name || String(service.id)).toLowerCase();

  switch (identifier) {
    case "discord":
      return <FontAwesome5 name="discord" size={size} color="#5865F2" />;
    case "weather":
      return <Ionicons name="cloud-outline" size={size} color="#60a5fa" />;
    case "timer":
      return <Ionicons name="timer-outline" size={size} color="#f59e0b" />;
    case "gmail":
      return <MaterialCommunityIcons name="gmail" size={size} color="#EA4335" />;
    case "github":
      return <FontAwesome5 name="github" size={size} color="#ffffff" />;
    case "youtube":
      return <FontAwesome5 name="youtube" size={size} color="#FF0000" />;
    case "slack":
      return <FontAwesome5 name="slack" size={size} color="#4A154B" />;
    case "trello":
      return <FontAwesome5 name="trello" size={size} color="#0079BF" />;
    default:
      return (
        <Ionicons
          name={connected ? "link-outline" : "unlink-outline"}
          size={size}
          color={color}
        />
      );
  }
};

const HomeServicesSection: React.FC<Props> = ({ services, onAddService }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Services connectés</Text>
        <TouchableOpacity onPress={onAddService}>
          <Text style={styles.link}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {services.map((service) => (
          <View key={service.id} style={styles.card}>
            <View style={styles.iconContainer}>
              {getServiceIcon(service)}
            </View>
            <Text style={styles.name}>{service.name}</Text>
            <Text
              style={[
                styles.status,
                service.connected ? styles.statusOn : styles.statusOff,
              ]}
            >
              {service.connected ? "Connecté" : "Non connecté"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#60a5fa",
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    width: "48%",
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 8,
  },
  name: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  status: {
    fontSize: 11,
    marginTop: 2,
  },
  statusOn: {
    color: "#22c55e",
  },
  statusOff: {
    color: "#f97316",
  },
});

export default HomeServicesSection;
