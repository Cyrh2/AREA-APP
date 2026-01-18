import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      // Pas besoin de navigation.replace("Home") :
      // RootNavigator bascule automatiquement quand isAuthenticated = true.
    } catch (error: any) {
      console.log("Login error", error?.response ?? error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.error ||
        (typeof error === "string" ? error : null) ||
        "Connexion échouée. Vérifie tes identifiants.";
      Alert.alert("Erreur", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Connecte-toi à ton compte AREA</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="exemple@mail.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, submitting && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#f9fafb" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => navigation.navigate("Signup")}
            disabled={submitting}
          >
            <Text style={styles.linkText}>Créer un compte</Text>
          </TouchableOpacity>

          <SocialAuthButtons />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    backgroundColor: "#020617",
    padding: 20,
    borderRadius: 16,
    gap: 12,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: "#e5e7eb",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#020617",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#f9fafb",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    fontSize: 13,
    color: "#60a5fa",
    textAlign: "center",
  },
});

export default LoginScreen;
