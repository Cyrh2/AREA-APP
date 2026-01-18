import { api } from '../lib/api';
import type { Service, ConfigSchema } from '../types';

export const serviceService = {
    getAll: () => api.get<Service[]>('/services'),

    getActionConfig: (serviceSlug: string, actionName: string) =>
        api.get<ConfigSchema>(`/services/${serviceSlug}/actions/${actionName}/config`),

    getReactionConfig: (serviceSlug: string, reactionName: string) =>
        api.get<ConfigSchema>(`/services/${serviceSlug}/reactions/${reactionName}/config`),

    getUserConnections: (userId: string) =>
        api.get<Record<string, boolean>>(`/services/my-connections?userId=${userId}`),

    disconnect: (provider: string, userId: string) =>
        api.delete(`/services/${provider}?userId=${userId}`),

    // Helper methods for dynamic dropdowns (Advanced Integration)

    getGithubRepos: async () => {
        try {
            const data = await api.get<any[]>('/services/github/repos');
            return data.map((repo: any) => ({ value: repo.full_name || repo.name, label: repo.full_name || repo.name }));
        } catch (e) {
            console.warn("Failed to fetch repos", e);
            return [];
        }
    },

    getDiscordChannels: async () => {
        try {
            const data = await api.get<any[]>('/services/discord/channels');
            return data.map((chan: any) => ({ value: chan.id, label: `#${chan.name}` }));
        } catch (e) {
            console.warn("Failed to fetch channels", e);
            return [];
        }
    },

    getSpotifyPlaylists: async () => {
        try {
            const data = await api.get<any[]>('/services/spotify/playlists');
            return data.map((pl: any) => ({ value: pl.id, label: pl.name }));
        } catch (e) {
            console.warn("Failed to fetch playlists", e);
            return [];
        }
    }
};
