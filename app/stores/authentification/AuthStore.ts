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
    },

    logout(): void {
      this.isAuthenticated = false;
      this.user = null;
      this.error = null;
      this.loading = false;
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

  persist: {
    storage: process.client ? localStorage : undefined,
  },
});
