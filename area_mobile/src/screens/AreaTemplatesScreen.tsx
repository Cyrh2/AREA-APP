// src/screens/AreaTemplatesScreen.tsx
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AREA_TEMPLATES } from "../data/areaTemplates";
import { RootStackParamList } from "../navigation/RootNavigator";
import { AreaTemplate } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList, "AreaTemplates">;

const AreaTemplatesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = AREA_TEMPLATES.filter(
    (template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTemplate = ({ item }: { item: AreaTemplate }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("CreateArea", { templateId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardTheme}>{item.theme}</Text>
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <View style={styles.servicesBadges}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.actionServiceSlug}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.reactionServiceSlug}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Templates d'AREAs</Text>
        <Text style={styles.subtitle}>
          Choisis un template pour créer ton automation
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un template..."
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f9fafb",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  searchInput: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    color: "#f9fafb",
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9fafb",
    marginBottom: 4,
  },
  cardTheme: {
    fontSize: 12,
    color: "#60a5fa",
    fontWeight: "500",
  },
  cardDescription: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 12,
    lineHeight: 20,
  },
  servicesBadges: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: "500",
  },
  arrow: {
    color: "#9ca3af",
    fontSize: 16,
    marginHorizontal: 8,
  },
});

export default AreaTemplatesScreen;
