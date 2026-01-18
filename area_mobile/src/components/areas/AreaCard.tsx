import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { BackendArea } from "../../types";
import { triggerArea, testArea, deleteArea } from "../../api/areasApi";

interface AreaCardProps {
    area: BackendArea;
    onRefresh: () => void;
}

const AreaCard: React.FC<AreaCardProps> = ({ area, onRefresh }) => {
    const handleTest = async () => {
        try {
            await testArea(area.id);
            Alert.alert("Succès", "Test exécuté avec succès !");
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    const handleTrigger = async () => {
        try {
            const res = await triggerArea(area.id);
            Alert.alert("Succès", res.message);
        } catch (error: any) {
            Alert.alert("Erreur", error.message);
        }
    };

    const handleDelete = () => {
        Alert.alert("Supprimer", "Voulez-vous vraiment supprimer cet AREA ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteArea(area.id);
                        onRefresh();
                    } catch (error: any) {
                        Alert.alert("Erreur", error.message);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.serviceName}>
                        {area.actions?.services?.slug || "Service"} ➜ {area.reactions?.services?.slug || "Service"}
                    </Text>
                    <Text style={styles.actionName}>
                        {area.actions?.name} ➜ {area.reactions?.name}
                    </Text>
                </View>
                <View style={[styles.statusBadge, area.is_active ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={styles.statusText}>{area.is_active ? "ACTIF" : "INACTIF"}</Text>
                </View>
            </View>

            <Text style={styles.paramsText}>
                Action: {JSON.stringify(area.action_params)}
            </Text>

            <View style={styles.footer}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    serviceName: {
        color: "#9ca3af",
        fontSize: 12,
        textTransform: "uppercase",
        fontWeight: "700",
        marginBottom: 4,
    },
    actionName: {
        color: "#f8fafc",
        fontSize: 16,
        fontWeight: "600",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
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
        fontSize: 10,
        fontWeight: "700",
    },
    paramsText: {
        color: "#cbd5e1",
        fontSize: 13,
        marginBottom: 16,
        fontFamily: "monospace",
    },
    footer: {
        flexDirection: "row",
        gap: 8,
    },
    button: {
        backgroundColor: "#334155",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    deleteButton: {
        backgroundColor: "#ef4444",
        marginLeft: "auto",
    },
    buttonText: {
        color: "#f8fafc",
        fontSize: 12,
        fontWeight: "600",
    },
});

export default AreaCard;
