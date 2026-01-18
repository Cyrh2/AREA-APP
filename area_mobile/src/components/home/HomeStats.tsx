import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  activeAreas: number;
  totalRunsToday: number;
  timeSaved: string;
}

const HomeStats: React.FC<Props> = ({ activeAreas, totalRunsToday, timeSaved }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>AREAs actifs</Text>
        <Text style={styles.cardValue}>{activeAreas}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Exécutions aujourd’hui</Text>
        <Text style={styles.cardValue}>{totalRunsToday}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Temps gagné</Text>
        <Text style={styles.cardValue}>{timeSaved}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardLabel: {
    color: "#9ca3af",
    fontSize: 11,
  },
  cardValue: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6,
  },
});

export default HomeStats;
