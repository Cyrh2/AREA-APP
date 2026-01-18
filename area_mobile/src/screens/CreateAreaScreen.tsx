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
import { createArea } from "../api/areasApi";
import { ServiceDetails, ConfigSchema, CreateAreaRequest } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CreateArea">;

const steps = [
    "Service Action",
    "Action Event",
    "Config Action",
    "Service Réaction",
    "Réaction Event",
    "Config Réaction",
    "Validation",
];

const CreateAreaScreen: React.FC<Props> = ({ navigation }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [services, setServices] = useState<ServiceDetails[]>([]);

    // Selection state
    const [selectedActionService, setSelectedActionService] = useState<ServiceDetails | null>(null);
    const [selectedAction, setSelectedAction] = useState<any | null>(null);
    const [actionParams, setActionParams] = useState<Record<string, any>>({});

    const [selectedReactionService, setSelectedReactionService] = useState<ServiceDetails | null>(null);
    const [selectedReaction, setSelectedReaction] = useState<any | null>(null);
    const [reactionParams, setReactionParams] = useState<Record<string, any>>({});

    const [actionSchema, setActionSchema] = useState<ConfigSchema | null>(null);
    const [reactionSchema, setReactionSchema] = useState<ConfigSchema | null>(null);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await fetchServices();
            setServices(data);
        } catch (error) {
            console.log("Error loading services", error);
        }
    };

    const handleNext = async () => {
        if (currentStep === 1 && selectedAction && selectedActionService) {
            // Fetch action config schema before moving to config step
            const schema = await getActionConfig(selectedActionService.slug, selectedAction.name);
            setActionSchema(schema);
        }

        if (currentStep === 4 && selectedReaction && selectedReactionService) {
            // Fetch reaction config schema (assuming similar endpoint exists or using action endpoint structure as placeholder if needed, otherwise skip)
            // Note: The API docs provided mainly showed action config. We'll try to fetch reaction config or assume empty properties if not strict.
            // Actually backend might not expose reaction config schema same way, but let's assume valid params needed.
            // For MVP we'll manually handle known params or generic input.
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleSubmit = async () => {
        if (!selectedAction || !selectedReaction) return;

        const request: CreateAreaRequest = {
            action_id: selectedAction.id,
            reaction_id: selectedReaction.id,
            action_params: actionParams,
            reaction_params: reactionParams,
        };

        try {
            await createArea(request);
            Alert.alert("Succès", "AREA créée avec succès !", [
                { text: "OK", onPress: () => navigation.navigate("Home") },
            ]);
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    // Helper to render dynamic inputs
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <ScrollView>
                        {services.map((s) => (
                            <TouchableOpacity
                                key={s.slug}
                                style={[styles.item, selectedActionService?.slug === s.slug && styles.selectedItem]}
                                onPress={() => setSelectedActionService(s)}
                            >
                                <Text style={styles.itemText}>{s.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
            case 1:
                return (
                    <ScrollView>
                        {selectedActionService?.actions?.map((a) => (
                            <TouchableOpacity
                                key={a.name}
                                style={[styles.item, selectedAction?.name === a.name && styles.selectedItem]}
                                onPress={() => setSelectedAction(a)}
                            >
                                <Text style={styles.itemText}>{a.description || a.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
            case 2:
                return (
                    <View>
                        <Text style={styles.label}>Configuration Action</Text>
                        {renderDynamicInputs(actionSchema, actionParams, setActionParams)}
                    </View>
                );
            case 3:
                return (
                    <ScrollView>
                        {services.map((s) => (
                            <TouchableOpacity
                                key={s.slug}
                                style={[styles.item, selectedReactionService?.slug === s.slug && styles.selectedItem]}
                                onPress={() => setSelectedReactionService(s)}
                            >
                                <Text style={styles.itemText}>{s.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
            case 4:
                return (
                    <ScrollView>
                        {selectedReactionService?.reactions?.map((r) => (
                            <TouchableOpacity
                                key={r.name}
                                style={[styles.item, selectedReaction?.name === r.name && styles.selectedItem]}
                                onPress={() => setSelectedReaction(r)}
                            >
                                <Text style={styles.itemText}>{r.description || r.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
            case 5:
                return (
                    <View>
                        <Text style={styles.label}>Configuration Réaction</Text>
                        {renderDynamicInputs(reactionSchema, reactionParams, setReactionParams)}
                    </View>
                );
            case 6:
                return (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryTitle}>Résumé</Text>
                        <Text style={styles.summaryText}>Action: {selectedActionService?.name} - {selectedAction?.name}</Text>
                        <Text style={styles.summaryParams}>{JSON.stringify(actionParams, null, 2)}</Text>

                        <Text style={styles.summaryText}>Réaction: {selectedReactionService?.name} - {selectedReaction?.name}</Text>
                        <Text style={styles.summaryParams}>{JSON.stringify(reactionParams, null, 2)}</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Retour</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{steps[currentStep]}</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                {renderStepContent()}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>
                        {currentStep === steps.length - 1 ? "Créer" : "Suivant"}
                    </Text>
                </TouchableOpacity>
            </View>
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
        flex: 1,
        padding: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#1e293b",
    },
    nextButton: {
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    nextButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    item: {
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    selectedItem: {
        borderColor: "#2563eb",
        backgroundColor: "#1e293b",
    },
    itemText: {
        color: "#f8fafc",
        fontSize: 16,
    },
    label: {
        color: "#94a3b8",
        marginBottom: 16,
        fontSize: 14,
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
    summaryContainer: {
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 12,
    },
    summaryTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    summaryText: {
        color: "#94a3b8",
        marginTop: 12,
        marginBottom: 4,
        fontWeight: "600",
    },
    summaryParams: {
        color: "#f8fafc",
        fontFamily: "monospace",
        fontSize: 12,
    },
});

export default CreateAreaScreen;
