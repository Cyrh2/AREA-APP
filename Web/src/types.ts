export interface UpdateUserRequest {
    email?: string;
    password?: string;
    data?: {
        username?: string;
    };
}

export interface ResetPasswordRequest {
    new_password?: string;
}

export interface User {
    id: string;
    email: string;
    username?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export interface ConfigSchema {
    type: string;
    properties: Record<string, {
        type: string;
        description?: string;
        minimum?: number;
        format?: string;
    }>;
    required?: string[];
}

export interface Action {
    id: number;
    name: string;
    description: string;
    slug: string;
    // Keeping params optional if legacy code uses it, but prefer config_schema
    params?: { name: string; label: string }[];
    config_schema?: ConfigSchema;
    ui_schema?: {
        name: string;
        type: string;
        label: string;
        source_url?: string;
        options?: { value: string; label: string }[];
        placeholder?: string;
    }[];
}

export interface Reaction {
    id: number;
    name: string;
    description: string;
    slug: string;
    params?: { name: string; label: string }[];
    config_schema?: ConfigSchema;
    ui_schema?: {
        name: string;
        type: string;
        label: string;
        source_url?: string;
        options?: { value: string; label: string }[];
        placeholder?: string;
    }[];
}

export interface Service {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color?: string; // Optional if not in new doc, but kept for UI
    textColor?: string;
    actions: Action[];
    reactions: Reaction[];
}

export interface Area {
    id: number;
    user_id: string;
    action_id: number;
    reaction_id: number;
    action_params: Record<string, any>;
    reaction_params: Record<string, any>;
    is_active: boolean;
    name?: string;
    last_executed_at: string | null;
    created_at?: string;
    updated_at?: string;
    // Enhanced structure from GET /areas response
    actions?: {
        name: string;
        services?: {
            slug: string;
        };
    };
    reactions?: {
        name: string;
        services?: {
            slug: string;
        };
    };
}
