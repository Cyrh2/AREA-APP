import apiClient from "./client";

export interface AuthUser {
  id: string;
  email: string;
  // Ajoute d'autres champs si le backend en renvoie (name, avatar, etc.)
  [key: string]: any;
}

export interface AuthResponse {
  token: string;        // garanti par la doc
  user?: AuthUser;      // optionnel, à confirmer / compléter plus tard
}

interface Credentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends Credentials {
  username: string;
}

export async function register(
  credentials: RegisterCredentials
): Promise<AuthResponse> {
  try {
    console.log("Registering user with credentials:", credentials);
    const response = await apiClient.post<AuthResponse>(
      "/auth/register/",
      credentials
    );
    console.log("Registration response data:", response.data);
    return response.data;
  } catch (error: any) {
    // Properly extract error message from backend response
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Erreur lors de l'inscription.";
    throw new Error(errorMessage);
  }
}

export async function login(credentials: Credentials): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login/",
      credentials
    );
    return response.data;
  } catch (error: any) {
    // Properly extract error message from backend response
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Erreur lors de la connexion.";
    throw new Error(errorMessage);
  }
}
