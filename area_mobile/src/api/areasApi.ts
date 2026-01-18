import apiClient from "./client";
import {
    BackendArea,
    CreateAreaRequest,
    AreaTestResponse,
} from "../types";

// Helper to extract error message
const getErrorMessage = (error: any, defaultMsg: string) => {
    return (
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        defaultMsg
    );
};

export async function createArea(request: CreateAreaRequest): Promise<BackendArea> {
    try {
        const response = await apiClient.post<{ message: string; area: BackendArea }>(
            "/areas",
            request
        );
        return response.data.area;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, "Erreur lors de la création de l'AREA."));
    }
}

export async function listAreas(): Promise<BackendArea[]> {
    try {
        const response = await apiClient.get<BackendArea[]>("/areas");
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, "Impossible de charger les AREAs."));
    }
}

export async function deleteArea(id: number): Promise<void> {
    try {
        await apiClient.delete(`/areas/${id}`);
    } catch (error: any) {
        throw new Error(getErrorMessage(error, "Erreur lors de la suppression de l'AREA."));
    }
}

export async function testArea(id: number): Promise<AreaTestResponse> {
    try {
        const response = await apiClient.post<AreaTestResponse>(`/areas/${id}/test`);
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, "Erreur lors du test de l'AREA."));
    }
}

export async function triggerArea(id: number): Promise<{ actionTriggered: boolean; message: string }> {
    try {
        const response = await apiClient.post<{ actionTriggered: boolean; message: string }>(
            `/areas/${id}/trigger`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, "Erreur lors du déclenchement de l'AREA."));
    }
}

export async function updateArea(id: number, request: Partial<CreateAreaRequest>): Promise<BackendArea> {
    try {
        const response = await apiClient.put<{ message: string; area: BackendArea }>(
            `/areas/${id}`,
            request
        );
        return response.data.area;
    } catch (error: any) {
        throw new Error(getErrorMessage(error, "Erreur lors de la mise à jour de l'AREA."));
    }
}
