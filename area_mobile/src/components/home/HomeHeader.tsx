import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  userName?: string;
  onProfilePress?: () => void;
}

const HomeHeader: React.FC<Props> = ({ userName = "Utilisateur", onProfilePress }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.hello}>Bonjour,</Text>
        <Text style={styles.name}>{userName} 👋</Text>
      </View>
      <TouchableOpacity style={styles.avatar} onPress={onProfilePress}>
        <Ionicons name="person-circle-outline" size={30} color="#e5e7eb" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hello: {
    color: "#9ca3af",
    fontSize: 14,
  },
  name: {
    color: "#f9fafb",
    fontSize: 22,
    fontWeight: "700",
  },
  avatar: {
    padding: 4,
    borderRadius: 999,
  },
});

export default HomeHeader;
