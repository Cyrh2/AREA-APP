import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

import AreaCard from "../components/areas/AreaCard";
import HomeHeader from "../components/home/HomeHeader";
import { listAreas } from "../api/areasApi";
import { BackendArea } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [areas, setAreas] = useState<BackendArea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadAreas = async () => {
    try {
      const data = await listAreas();
      setAreas(data);
    } catch (error: any) {
      console.log("Erreur loading areas", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAreas();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAreas();
  };

  const handleCreateArea = () => {
    navigation.navigate("CreateArea");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}

      >
        <HomeHeader
          userName="AREA User"
          onProfilePress={() => navigation.navigate("Settings")}
        />

        <Text style={styles.subtitle}>
          Gérez vos automatisations entre services depuis une seule interface.
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateArea}>
            <Text style={styles.createButtonText}>+ Nouvelle AREA</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Mes AREAs</Text>

        {loading && !refreshing ? (
          <Text style={styles.emptyText}>Chargement...</Text>
        ) : areas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune AREA configurée.</Text>
            <Text style={styles.emptySubText}>Créez votre première automatisation maintenant !</Text>
          </View>
        ) : (
          areas.map((area) => (
            <AreaCard key={area.id} area={area} onRefresh={loadAreas} />
          ))
        )}
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 24,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#1e293b55",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#334155",
  },
  emptyText: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubText: {
    color: "#9ca3af",
    fontSize: 13,
  },
});

export default HomeScreen;
