// src/types/index.ts

// ---------- Services (backend) ----------

export type ServiceId = string;

// --- API Schema Types ---

export interface ConfigSchema {
  type: string;
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

export interface SchemaProperty {
  type: string;
  minimum?: number;
  maximum?: number;
  format?: string;
  description?: string;
  enum?: any[];
}

// Backend service structure from GET /services
export interface BackendService {
  id?: number | string;
  name: string;             // ex: "Discord"
  slug: string;             // ex: "discord"
  icon?: string;            // ex: "discord"
  actions: BackendAction[];
  reactions: BackendReaction[];
}

export interface BackendAction {
  id?: number;
  name: string;        // e.g. "new_message"
  slug?: string;       // e.g. "discord_new_message"
  description: string; // e.g. "Quand un nouveau message est posté"
  config_schema?: ConfigSchema;
  ui_schema?: Array<{
    name: string;
    type: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
  }>;
}

export interface BackendReaction {
  id?: number;
  name: string;        // e.g. "post_message"
  slug?: string;       // e.g. "discord_send_message"
  description: string; // e.g. "Poster un message"
  config_schema?: ConfigSchema;
  ui_schema?: Array<{
    name: string;
    type: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
  }>;
}

// Full service with actions and reactions using numeric IDs if available
export interface ServiceDetails extends BackendService {
  id: number | string; // slug or numeric id depending on context
}

export interface ActionDetails extends BackendAction {
  id: number;
}

export interface ReactionDetails extends BackendReaction {
  id: number;
}

// --- AREA Types ---

// AREA creation request model
export interface CreateAreaRequest {
  action_id: number;
  reaction_id: number;
  action_params: Record<string, any>;
  reaction_params: Record<string, any>;
}

// AREA structure from backend
export interface BackendArea {
  id: number;
  user_id: string;
  action_id: number;
  reaction_id: number;
  action_params: Record<string, any>;
  reaction_params: Record<string, any>;
  is_active: boolean;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
  actions?: {
    name: string;
    services: { slug: string };
  };
  reactions?: {
    name: string;
    services: { slug: string };
  };
}

// AREA test/trigger response
export interface AreaTestResponse {
  message: string;
  areaId: number;
  action: string;
  reaction: string;
  timestamp: string;
}

// --- UI Types ---

// Template Field for AREA creation wizard
export interface AreaTemplateField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "time" | "number";
  placeholder?: string;
  helperText?: string;
  options?: Array<{ label: string; value: string }>;
}

// AREA Template for predefined configurations
export interface AreaTemplate {
  id: string;
  title: string;
  description: string;
  theme: string;
  actionServiceSlug: string;
  actionName: string;
  reactionServiceSlug: string;
  reactionName: string;
  actionFields: AreaTemplateField[];
  reactionFields: AreaTemplateField[];
}

// Service for UI display (simplified)
export interface Service {
  id: string | number;
  name: string;
  slug?: string;
  connected?: boolean;
  icon?: string;
}

// Activity Item for Home Feed
export interface ActivityItem {
  id: string;
  type: "success" | "error";
  message: string;
  timeAgo: string; // ex: "il y a 5 min"
}

// Legacy UI Area type (adapter for HomeScreen if needed, or replace usage with BackendArea)
export interface Area {
  id: string;
  name: string;
  description: string;
  services: ServiceId[]; // liste de slugs "github", "discord", etc.
  active: boolean;
  favorite?: boolean;
  lastRun?: string;      // ex: "Jamais", "il y a 5 min"
}
