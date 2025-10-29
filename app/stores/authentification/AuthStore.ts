/** Store Pinia - Gestion de l'authentification */
import { defineStore } from "pinia";
import type { User, PublicUser } from "@/types/User";
import type { LoginRequest } from "@/types/Api";
import { ApiService } from "@/services/ApiService";

interface AuthState {
  isAuthenticated: boolean;
  user: PublicUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuth: (state): boolean => state.isAuthenticated,
    currentUser: (state): PublicUser | null => state.user,
    hasRole:
      (state) =>
      (role: User["role"]): boolean => {
        return state.user?.role === role;
      },
    isAdmin: (state): boolean => state.user?.role === "admin",
    isRestaurateur: (state): boolean => state.user?.role === "restaurateur",
    isUser: (state): boolean => state.user?.role === "user",
  },

  actions: {
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

    loginUser(user: User): void {
      const { password, ...publicUser } = user;
      this.isAuthenticated = true;
      this.user = publicUser;
      this.error = null;

      // Persister l'état d'authentification
      if (import.meta.client) {
        localStorage.setItem("auth-user", JSON.stringify(publicUser));
        localStorage.setItem("auth-isAuthenticated", "true");
      }
    },

    logout(): void {
      this.isAuthenticated = false;
      this.user = null;
      this.error = null;

      // Nettoyer la persistance
      if (import.meta.client) {
        localStorage.removeItem("auth-user");
        localStorage.removeItem("auth-isAuthenticated");
      }
    },

    // Restaurer l'état depuis localStorage
    initializeAuth(): void {
      if (import.meta.client) {
        const savedUser = localStorage.getItem("auth-user");
        const savedAuth = localStorage.getItem("auth-isAuthenticated");

        if (savedUser && savedAuth === "true") {
          try {
            this.user = JSON.parse(savedUser);
            this.isAuthenticated = true;
          } catch (error) {
            console.error(
              "Erreur lors de la restauration de l'authentification:",
              error
            );
            this.logout();
          }
        }
      }
    },

    updateUser(userData: Partial<PublicUser>): void {
      if (this.user) {
        this.user = { ...this.user, ...userData };
      }
    },

    clearError(): void {
      this.error = null;
    },
  },
});
