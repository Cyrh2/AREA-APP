import { ConfigSchema, ServiceDetails } from "../types";
import apiClient from "./client";

/**
 * Fetch services from backend and transform to mobile-friendly format
 * Backend returns: { name, slug, icon, actions[], reactions[] }
 */
export async function fetchServices(): Promise<ServiceDetails[]> {
  try {
    const response = await apiClient.get<ServiceDetails[]>("/services");
    return response.data;
  } catch (error: any) {
    throw new Error("Impossible de charger les services.");
  }
}

/**
 * Get configuration schema for a specific action
 * Fetches from service data's ui_schema
 */
export async function getActionConfig(
  serviceSlug: string,
  actionName: string
): Promise<ConfigSchema> {
  try {
    // Get all services
    const services = await fetchServices();
    const service = services.find(s => s.slug === serviceSlug);
    
    if (!service) {
      console.warn(`Service not found: ${serviceSlug}`);
      return { type: "object", properties: {} };
    }
    
    // Find the action
    const action = service.actions.find(a => 
      a.name === actionName || a.slug === actionName
    );
    
    if (!action || !action.ui_schema) {
      console.warn(`Action not found or no ui_schema: ${actionName}`);
      return { type: "object", properties: {} };
    }
    
    // Convert ui_schema to ConfigSchema format
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    action.ui_schema.forEach((field: any) => {
      properties[field.name] = {
        type: field.type === 'textarea' ? 'string' : field.type,
        description: field.label || field.placeholder
      };
      if (field.required) {
        required.push(field.name);
      }
    });
    
    return { 
      type: "object", 
      properties,
      required: required.length > 0 ? required : undefined
    };
  } catch (error: any) {
    console.warn("Erreur fetch config schema action", error);
    return { type: "object", properties: {} };
  }
}

/**
 * Get configuration schema for a specific reaction
 * Fetches from service data's ui_schema
 */
export async function getReactionConfig(
  serviceSlug: string,
  reactionName: string
): Promise<ConfigSchema> {
  try {
    // Get all services
    const services = await fetchServices();
    const service = services.find(s => s.slug === serviceSlug);
    
    if (!service) {
      console.warn(`Service not found: ${serviceSlug}`);
      return { type: "object", properties: {} };
    }
    
    // Find the reaction
    const reaction = service.reactions.find(r => 
      r.name === reactionName || r.slug === reactionName
    );
    
    if (!reaction || !reaction.ui_schema) {
      console.warn(`Reaction not found or no ui_schema: ${reactionName}`);
      return { type: "object", properties: {} };
    }
    
    // Convert ui_schema to ConfigSchema format
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    reaction.ui_schema.forEach((field: any) => {
      properties[field.name] = {
        type: field.type === 'textarea' ? 'string' : field.type,
        description: field.label || field.placeholder
      };
      if (field.required) {
        required.push(field.name);
      }
    });
    
    return { 
      type: "object", 
      properties,
      required: required.length > 0 ? required : undefined
    };
  } catch (error: any) {
    console.warn("Erreur fetch config schema reaction", error);
    return { type: "object", properties: {} };
  }
}

