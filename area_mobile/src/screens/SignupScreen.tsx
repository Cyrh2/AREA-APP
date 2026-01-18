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
import PasswordStrengthIndicator, {
  validatePassword,
} from "../components/auth/PasswordStrengthIndicator";
import SocialAuthButtons from "../components/auth/SocialAuthButtons";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const handleSignup = async () => {
    if (!username || !email || !password || !passwordConfirm) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert(
        "Mot de passe trop faible",
        "Le mot de passe doit contenir au moins 8 caractères, 1 lettre, 1 chiffre et 1 caractère spécial (@$!%*?&)."
      );
      return;
    }

    setSubmitting(true);
    try {
      console.log("authentification started :", { email, password, username });
      await register(email, password, username);
      console.log("authentification finished :", { email, password, username });
      // RootNavigator va te basculer vers Home automatiquement
    } catch (error: any) {
      console.log("Signup error >>>", error);

      // L'erreur peut être:
      // 1. Un objet direct du backend: { error: "..." } ou { message: "..." }
      // 2. Une string directement
      // 3. Une erreur Axios avec error.response.data
      let backendMessage: string | undefined;

      if (typeof error === "string") {
        backendMessage = error;
      } else if (error?.error) {
        // Objet { error: "..." } throwé par authApi
        backendMessage = error.error;
      } else if (error?.message && !error?.response) {
        // Erreur JS normale (ex: Network Error)
        backendMessage = error.message;
      } else if (error?.response?.data) {
        // Erreur Axios non-transformée
        backendMessage = error.response.data.error || error.response.data.message;
      }

      let message = backendMessage;

      // Si c'est une erreur de mot de passe faible du backend
      if (backendMessage?.includes("Password too weak")) {
        message =
          "Mot de passe trop faible.\n\nExigences :\n• Minimum 8 caractères\n• Au moins 1 lettre\n• Au moins 1 chiffre\n• Au moins 1 caractère spécial (@$!%*?&)";
      } else if (!message) {
        message = "Inscription échouée. Réessaie avec d'autres informations.";
      }

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
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Crée ton compte AREA</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          <TextInput
            style={styles.input}
            placeholder="MonPseudo"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

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
          <PasswordStrengthIndicator password={password} />

          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
          />

          <TouchableOpacity
            style={[styles.button, submitting && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#f9fafb" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => navigation.navigate("Login")}
            disabled={submitting}
          >
            <Text style={styles.linkText}>
              Déjà un compte ? Se connecter
            </Text>
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
    backgroundColor: "#22c55e",
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

export default SignupScreen;
