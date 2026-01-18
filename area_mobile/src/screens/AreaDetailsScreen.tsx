import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { BackendArea } from "../types";
import { triggerArea, testArea, deleteArea } from "../api/areasApi";
import apiClient from "../api/client";

// Since we don't have a getArea(id) yet in api/areasApi (oops, I forgot to add it in the list), 
// we'll either add it or just find it from list if passed param is just ID.
// Ideally we should have getArea. For now let's implement a quick fetch or pass full object.
// Navigation params usually pass minimal data (ID).

type Props = NativeStackScreenProps<RootStackParamList, "AreaDetails">;

const AreaDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { areaId } = route.params;
    const [area, setArea] = useState<BackendArea | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadArea();
    }, [areaId]);

    const loadArea = async () => {
        try {
            // Assuming GET /areas returns list, we might need GET /areas/:id
            // If endpoint doesn't exist, we might filter from listAreas (inefficient but works for MVP)
            // Or try GET /areas/:id
            const response = await apiClient.get<BackendArea>(`/areas/${areaId}`);
            setArea(response.data);
        } catch (error) {
            console.log("Error fetching area details", error);
            Alert.alert("Erreur", "Impossible de charger les détails de l'AREA.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        if (!area) return;
        try {
            await testArea(area.id);
            Alert.alert("Succès", "Test exécuté avec succès !");
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    const handleTrigger = async () => {
        if (!area) return;
        try {
            const res = await triggerArea(area.id);
            Alert.alert("Succès", res.message);
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    const handleDelete = () => {
        if (!area) return;
        Alert.alert("Supprimer", "Voulez-vous vraiment supprimer cet AREA ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteArea(area.id);
                        navigation.goBack();
                    } catch (error: any) {
                        Alert.alert("Erreur", error.message);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Chargement...</Text>
            </SafeAreaView>
        );
    }

    if (!area) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Retour</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails AREA</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <View style={[styles.statusBadge, area.is_active ? styles.activeBadge : styles.inactiveBadge]}>
                        <Text style={styles.statusText}>{area.is_active ? "ACTIF" : "INACTIF"}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Action: {area.actions?.name}</Text>
                    <Text style={styles.serviceName}>Service: {area.actions?.services?.slug}</Text>
                    <View style={styles.codeBlock}>
                        <Text style={styles.code}>{JSON.stringify(area.action_params, null, 2)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Réaction: {area.reactions?.name}</Text>
                    <Text style={styles.serviceName}>Service: {area.reactions?.services?.slug}</Text>
                    <View style={styles.codeBlock}>
                        <Text style={styles.code}>{JSON.stringify(area.reaction_params, null, 2)}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => navigation.navigate("EditArea", { areaId: area.id })}>
                        <Text style={styles.buttonText}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleTest}>
                        <Text style={styles.buttonText}>Tester</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleTrigger}>
                        <Text style={styles.buttonText}>Déclencher</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                        <Text style={styles.buttonText}>Supprimer</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1e293b",
    },
    headerTitle: {
        color: "#f8fafc",
        fontSize: 18,
        fontWeight: "700",
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: "#94a3b8",
        fontSize: 14,
    },
    content: {
        padding: 20,
    },
    loadingText: {
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    sectionTitle: {
        color: "#f8fafc",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    serviceName: {
        color: "#94a3b8",
        fontSize: 12,
        textTransform: "uppercase",
        marginBottom: 12,
    },
    codeBlock: {
        backgroundColor: "#0f172a",
        padding: 12,
        borderRadius: 8,
    },
    code: {
        color: "#cbd5e1",
        fontFamily: "monospace",
        fontSize: 12,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 99,
    },
    activeBadge: {
        backgroundColor: "#22c55e33",
    },
    inactiveBadge: {
        backgroundColor: "#ef444433",
    },
    statusText: {
        color: "#f8fafc",
        fontSize: 12,
        fontWeight: "700",
    },
    actions: {
        gap: 12,
    },
    button: {
        backgroundColor: "#334155",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    deleteButton: {
        backgroundColor: "#ef4444",
    },
    editButton: {
        backgroundColor: "#f59e0b",
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default AreaDetailsScreen;
