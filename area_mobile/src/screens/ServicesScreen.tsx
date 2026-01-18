import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  fetchServices,
} from "../api/servicesApi";
import HomeServicesSection from "../components/home/HomeServicesSection";
import { useAuth } from "../context/AuthContext";
import { Service } from "../types";

const ServicesScreen: React.FC = () => {
  const { logout } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const servicesList = await fetchServices();

        setServices(servicesList);
      } catch (err: any) {
        console.log(
          "Erreur chargement services >>>",
          err?.message,
          err?.response?.data
        );

        const status = err?.response?.status;
        const backendMsg =
          err?.response?.data?.error || err?.response?.data?.message;

        if (status === 401 && backendMsg === "Invalid token") {
          Alert.alert(
            "Session expirée",
            "Veuillez vous reconnecter.",
            [
              {
                text: "OK",
                onPress: () => logout(),
              },
            ]
          );
          return;
        }

        setError(
          backendMsg ??
            "Impossible de charger les services pour le moment."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [logout]);

  const handleAddService = () => {
    Alert.alert(
      "Connexion de service",
      "La connexion OAuth (Discord, Gmail, etc.) sera implémentée plus tard."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>
          Voici les services disponibles dans AREA (Discord, Timer, Weather,
          etc.).
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#f9fafb" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <HomeServicesSection
            services={services}
            onAddService={handleAddService}
          />
        )}
      </ScrollView>
    </SafeAreaView>
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
  title: {
    color: "#f9fafb",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 16,
  },
  error: {
    color: "#f97373",
    fontSize: 13,
    marginTop: 8,
  },
});

export default ServicesScreen;
