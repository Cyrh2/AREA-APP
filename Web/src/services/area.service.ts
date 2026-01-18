import { api } from '../lib/api';
import type { Area } from '../types';

interface CreateAreaPayload {
    action_id: number;
    reaction_id: number;
    action_params: Record<string, any>;
    reaction_params: Record<string, any>;
    name: string;
}

export const areaService = {
    getAll: () => api.get<Area[]>('/areas'),

    create: (area: CreateAreaPayload) => api.post<Area>('/areas', area),

    update: (id: number, area: Partial<Area>) => {
        // Backend doesn't show PUT /areas/:id in provided doc, but keeping it as it's standard
        return api.put<Area>(`/areas/${id}`, area);
    },

    delete: (id: number) => {
        // Backend doesn't show DELETE in provided doc, but keeping it
        return api.delete(`/areas/${id}`);
    },

    // Step 6.2: Trigger AREA (Check Action First)
    trigger: (id: number) => api.post<{ actionTriggered: boolean; message: string }>(`/areas/${id}/trigger`, {}),

    // Step 6.1: Test AREA (Bypass Action Check)
    test: (id: number) => api.post<{ message: string; areaId: number }>(`/areas/${id}/test`, {})
};
