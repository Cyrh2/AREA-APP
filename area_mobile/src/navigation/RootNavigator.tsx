import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AreaTemplatesScreen from "../screens/AreaTemplatesScreen";
import CreateAreaScreen from "../screens/CreateAreaScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import MainTabs from "./MainTabs";
import AreaDetailsScreen from "../screens/AreaDetailsScreen";
import EditAreaScreen from "../screens/EditAreaScreen";

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  CreateArea: undefined;
  AreaDetails: { areaId: number };
  EditArea: { areaId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f9fafb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={MainTabs} />
          <Stack.Screen name="CreateArea" component={CreateAreaScreen} />
          <Stack.Screen name="AreaDetails" component={AreaDetailsScreen} />
          <Stack.Screen name="EditArea" component={EditAreaScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RootNavigator;
