import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Area } from "../../types";

interface Props {
  areas: Area[];
  onToggleActive: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

type Filter = "all" | "active" | "inactive" | "favorites";

const HomeAreasList: React.FC<Props> = ({
  areas,
  onToggleActive,
  onToggleFavorite,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      if (filter === "active" && !area.active) return false;
      if (filter === "inactive" && area.active) return false;
      if (filter === "favorites" && !area.favorite) return false;

      const term = search.toLowerCase();
      if (!term) return true;

      return (
        area.name.toLowerCase().includes(term) ||
        area.description.toLowerCase().includes(term)
      );
    });
  }, [areas, filter, search]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mes AREAs</Text>
        <Text style={styles.count}>{areas.length} au total</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Rechercher un AREA..."
        placeholderTextColor="#6b7280"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
        {[
          { key: "all", label: "Tous" },
          { key: "active", label: "Actifs" },
          { key: "inactive", label: "Inactifs" },
          { key: "favorites", label: "Favoris" },
        ].map((f) => {
          const isActive = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(f.key as Filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredAreas.length === 0 ? (
        <Text style={styles.emptyText}>
          Aucun AREA ne correspond à ta recherche.
        </Text>
      ) : (
        <View style={styles.list}>
          {filteredAreas.map((area) => (
            <View key={area.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.cardTitle}>{area.name}</Text>
                  {area.favorite && (
                    <Ionicons name="star" size={14} color="#facc15" />
                  )}
                </View>
                <TouchableOpacity onPress={() => onToggleFavorite(area.id)}>
                  <Ionicons
                    name={area.favorite ? "star" : "star-outline"}
                    size={20}
                    color={area.favorite ? "#facc15" : "#9ca3af"}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardDesc}>{area.description}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.servicesRow}>
                  {area.services.map((s) => (
                    <View key={s} style={styles.serviceBadge}>
                      <Text style={styles.serviceText}>{s}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.lastRun}>Dernier run : {area.lastRun}</Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    area.active ? styles.toggleOn : styles.toggleOff,
                  ]}
                  onPress={() => onToggleActive(area.id)}
                >
                  <MaterialIcons
                    name={area.active ? "toggle-on" : "toggle-off"}
                    size={32}
                    color={area.active ? "#22c55e" : "#6b7280"}
                  />
                  <Text style={styles.toggleText}>
                    {area.active ? "Activé" : "Désactivé"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={16} color="#e5e7eb" />
                  <Text style={styles.editText}>Détails / éditer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
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
    alignItems: "flex-end",
    marginBottom: 8,
  },
  title: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "600",
  },
  count: {
    color: "#9ca3af",
    fontSize: 12,
  },
  search: {
    backgroundColor: "#020617",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: "#f9fafb",
    fontSize: 13,
    marginBottom: 8,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
  },
  filterText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  filterTextActive: {
    color: "#f9fafb",
    fontWeight: "600",
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    color: "#f9fafb",
    fontSize: 15,
    fontWeight: "600",
  },
  cardDesc: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  servicesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    maxWidth: "70%",
  },
  serviceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  serviceText: {
    color: "#e5e7eb",
    fontSize: 11,
  },
  lastRun: {
    color: "#6b7280",
    fontSize: 11,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  toggleOn: {},
  toggleOff: {},
  toggleText: {
    color: "#e5e7eb",
    fontSize: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    color: "#e5e7eb",
    fontSize: 12,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 6,
  },
});

export default HomeAreasList;
