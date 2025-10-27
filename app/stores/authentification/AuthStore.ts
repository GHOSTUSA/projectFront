import { defineStore } from "pinia";
import type { User, PublicUser } from "@/types/User";
import type { LoginRequest } from "@/types/Api";
import { ApiService } from "@/services/ApiService";

/**
 * Interface pour l'état du store d'authentification
 * Définit la structure des données d'authentification
 */
interface AuthState {
  /** Indique si l'utilisateur est connecté */
  isAuthenticated: boolean;

  /** Données de l'utilisateur connecté (sans mot de passe) */
  user: PublicUser | null;

  /** État de chargement des opérations d'authentification */
  loading: boolean;

  /** Message d'erreur en cas d'échec d'authentification */
  error: string | null;
}

/**
 * Store Pinia pour la gestion de l'authentification
 * Gère l'état global de connexion et les opérations d'auth
 */
export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Getter pour l'état d'authentification
     * @returns boolean - true si l'utilisateur est connecté
     */
    isAuth: (state): boolean => state.isAuthenticated,

    /**
     * Getter pour l'utilisateur actuel
     * @returns PublicUser | null - données utilisateur ou null
     */
    currentUser: (state): PublicUser | null => state.user,

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     * @returns fonction qui prend un rôle et retourne boolean
     */
    hasRole:
      (state) =>
      (role: User["role"]): boolean => {
        return state.user?.role === role;
      },

    /**
     * Vérifie si l'utilisateur est administrateur
     * @returns boolean
     */
    isAdmin: (state): boolean => state.user?.role === "admin",

    /**
     * Vérifie si l'utilisateur est restaurateur
     * @returns boolean
     */
    isRestaurateur: (state): boolean => state.user?.role === "restaurateur",

    /**
     * Vérifie si l'utilisateur est un client standard
     * @returns boolean
     */
    isUser: (state): boolean => state.user?.role === "user",
  },

  actions: {
    /**
     * Connecte un utilisateur avec email/password
     * @param credentials - Email et mot de passe
     * @returns Promise<boolean> - succès de la connexion
     */
    async login(credentials: LoginRequest): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const user = await ApiService.login(credentials);

        if (user) {
          this.isAuthenticated = true;
          this.user = user;
          return true;
        } else {
          this.error = "Email ou mot de passe incorrect";
          return false;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erreur de connexion";
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Connecte directement un utilisateur (pour les données statiques)
     * @param user - Données utilisateur complètes
     */
    loginUser(user: User): void {
      const { password, ...publicUser } = user;
      this.isAuthenticated = true;
      this.user = publicUser;
      this.error = null;
    },

    /**
     * Déconnecte l'utilisateur actuel
     * Remet à zéro toutes les données d'authentification
     */
    logout(): void {
      this.isAuthenticated = false;
      this.user = null;
      this.error = null;
      this.loading = false;
    },

    /**
     * Met à jour les informations de l'utilisateur connecté
     * @param userData - Nouvelles données utilisateur partielles
     */
    updateUser(userData: Partial<PublicUser>): void {
      if (this.user) {
        this.user = { ...this.user, ...userData };
      }
    },

    /**
     * Efface les erreurs d'authentification
     */
    clearError(): void {
      this.error = null;
    },
  },

  /**
   * Configuration de la persistance
   * Sauvegarde l'état d'authentification dans localStorage
   */
  persist: {
    storage: process.client ? localStorage : undefined,
  },
});
