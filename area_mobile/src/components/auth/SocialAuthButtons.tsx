import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Provider = "google" | "facebook" | "x";

interface Props {
  onSelectProvider?: (provider: Provider) => void;
}

const SocialAuthButtons: React.FC<Props> = ({ onSelectProvider }) => {
  const handlePress = (provider: Provider) => {
    if (onSelectProvider) {
      onSelectProvider(provider);
    } else {
      const label =
        provider === "google"
          ? "Google"
          : provider === "facebook"
          ? "Facebook"
          : "X";

      Alert.alert(
        "À implémenter",
        `Inscription / connexion via ${label} sera branchée au backend (OAuth).`
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.separatorRow}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>Ou continuer avec</Text>
        <View style={styles.separatorLine} />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handlePress("google")}
        >
          <Ionicons name="logo-google" size={18} color="#f9fafb" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handlePress("facebook")}
        >
          <Ionicons name="logo-facebook" size={18} color="#f9fafb" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handlePress("x")}
        >
          <Ionicons name="logo-twitter" size={18} color="#f9fafb" />
          <Text style={styles.socialText}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1f2937",
  },
  separatorText: {
    marginHorizontal: 8,
    color: "#6b7280",
    fontSize: 12,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#020617",
  },
  socialText: {
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default SocialAuthButtons;
