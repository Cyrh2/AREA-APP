import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { fetchServices, getActionConfig, getReactionConfig } from "../api/servicesApi";
import { updateArea } from "../api/areasApi";
import { ServiceDetails, ConfigSchema, BackendArea, CreateAreaRequest } from "../types";
import apiClient from "../api/client";

type Props = NativeStackScreenProps<RootStackParamList, "EditArea">;

const EditAreaScreen: React.FC<Props> = ({ route, navigation }) => {
    const { areaId } = route.params;
    const [area, setArea] = useState<BackendArea | null>(null);
    const [loading, setLoading] = useState(true);

    const [actionParams, setActionParams] = useState<Record<string, any>>({});
    const [reactionParams, setReactionParams] = useState<Record<string, any>>({});

    // We need schemas to know input types
    const [actionSchema, setActionSchema] = useState<ConfigSchema | null>(null);
    const [reactionSchema, setReactionSchema] = useState<ConfigSchema | null>(null);

    useEffect(() => {
        loadAreaAndSchemas();
    }, []);

    const loadAreaAndSchemas = async () => {
        try {
            // Fetch area details
            const areaResponse = await apiClient.get<BackendArea>(`/areas/${areaId}`);
            const areaData = areaResponse.data;
            setArea(areaData);
            setActionParams(areaData.action_params);
            setReactionParams(areaData.reaction_params);

            // Fetch schemas
            if (areaData.actions && areaData.actions.services) {
                const aSchema = await getActionConfig(areaData.actions.services.slug, areaData.actions.name);
                setActionSchema(aSchema);
            }
            if (areaData.reactions && areaData.reactions.services) {
                // Assuming we can fetch reaction config too
                const rSchema = await getReactionConfig(areaData.reactions.services.slug, areaData.reactions.name);
                setReactionSchema(rSchema);
            }
        } catch (error) {
            console.log("Error loading area for edit", error);
            Alert.alert("Erreur", "Impossible de charger les données");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!area) return;

        // We only allow updating params for now, not changing the service/action types completely 
        // (that would essentially be a new AREA)
        const request: Partial<CreateAreaRequest> = {
            action_params: actionParams,
            reaction_params: reactionParams,
        };

        try {
            await updateArea(area.id, request);
            Alert.alert("Succès", "AREA mise à jour avec succès !", [
                { text: "OK", onPress: () => navigation.navigate("Home") }
            ]);
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    const renderDynamicInputs = (schema: ConfigSchema | null, params: any, setParams: any) => {
        if (!schema?.properties || Object.keys(schema.properties).length === 0) {
            return <Text style={styles.infoText}>Aucune configuration requise.</Text>;
        }

        return Object.keys(schema.properties).map((key) => (
            <View key={key} style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{key}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={schema.properties[key].description || key}
                    placeholderTextColor="#64748b"
                    value={params[key] ? String(params[key]) : ""}
                    onChangeText={(text) => {
                        const val = schema.properties[key].type === "integer" ? (parseInt(text) || 0) : text;
                        setParams({ ...params, [key]: val });
                    }}
                    keyboardType={schema.properties[key].type === "integer" ? "numeric" : "default"}
                />
            </View>
        ));
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
                    <Text style={styles.backButtonText}>← Annuler</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier AREA</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Action: {area.actions?.name}</Text>
                    <Text style={styles.serviceName}>Service: {area.actions?.services?.slug}</Text>
                    <View style={styles.formContainer}>
                        <Text style={styles.subLabel}>Paramètres</Text>
                        {renderDynamicInputs(actionSchema, actionParams, setActionParams)}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Réaction: {area.reactions?.name}</Text>
                    <Text style={styles.serviceName}>Service: {area.reactions?.services?.slug}</Text>
                    <View style={styles.formContainer}>
                        <Text style={styles.subLabel}>Paramètres</Text>
                        {renderDynamicInputs(reactionSchema, reactionParams, setReactionParams)}
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
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
        marginBottom: 16,
    },
    formContainer: {
        marginTop: 8,
    },
    subLabel: {
        color: "#cbd5e1",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        color: "#f8fafc",
        marginBottom: 8,
        textTransform: "capitalize",
    },
    input: {
        backgroundColor: "#0f172a",
        borderWidth: 1,
        borderColor: "#334155",
        borderRadius: 8,
        padding: 12,
        color: "#f8fafc",
    },
    infoText: {
        color: "#64748b",
        fontStyle: "italic",
    },
    saveButton: {
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default EditAreaScreen;
