import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const SettingsScreen: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Tu vas être déconnecté de ton compte.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          // RootNavigator détecte isAuthenticated = false et renvoie sur Login
        },
      },
    ]);
  };

  const handleTheme = () => {
    Alert.alert("TODO", "Mode clair / sombre (qu'on a mis en pause 😄).");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Réglages</Text>
        <Text style={styles.subtitle}>
          Paramètres de ton compte et de l’application.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compte</Text>

          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <Text style={[styles.rowText, { color: "#f97373" }]}>
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>

        {/* ... ton bloc Apparence/Autres si tu veux garder ... */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
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
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    paddingVertical: 8,
  },
  rowText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
});

export default SettingsScreen;
