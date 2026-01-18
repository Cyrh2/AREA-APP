import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import HomeScreen from "../screens/HomeScreen";
import ServicesScreen from "../screens/ServicesScreen";
import SettingsScreen from "../screens/SettingsScreen";

export type MainTabParamList = {
  Home: undefined;
  Services: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#020617",
          borderTopColor: "#1f2937",
        },
        tabBarActiveTintColor: "#f9fafb",
        tabBarInactiveTintColor: "#6b7280",
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Services") iconName = "git-branch-outline";
          else iconName = "settings-outline";

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{ title: "Services" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Réglages" }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
