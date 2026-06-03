/* Store Pinia pour la gestion de l'authentification utilisateur */
import { defineStore } from "pinia";
import type { User, PublicUser } from "@/types/User";
import type { LoginRequest } from "@/types/Api";
import { ApiService } from "~/services/ApiService";

interface AuthState {
  isAuthenticated: boolean;
  user: PublicUser | null;
  token?: string | null;
  loading: boolean;
  error: string | null;
}

interface ProfileUpdateInput {
  email?: string;
  firstName?: string;
  lastName?: string;
}

const normalizeUserRole = (role?: string | null) => {
  if (!role) return role;

  const normalizedRole = role.toUpperCase();
  if (normalizedRole === "RESTAURANT") return "restaurateur";
  if (normalizedRole === "ADMIN") return "admin";
  if (normalizedRole === "USER") return "user";

  return role.toLowerCase();
};

const toDisplayName = (value?: string | null): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const normalizePublicUser = (
  user: PublicUser,
  fallback?: Partial<PublicUser> | null,
): PublicUser => {
  const candidateUser = user as PublicUser & {
    firstName?: string;
    lastName?: string;
  };
  const fallbackUser = (fallback || {}) as Partial<PublicUser> & {
    firstName?: string;
    lastName?: string;
  };

  const emailPrefix = String(candidateUser.email || "").split("@")[0] || "";
  const fallbackFirstName = toDisplayName(emailPrefix) || "Utilisateur";

  return {
    ...candidateUser,
    firstName:
      toDisplayName(candidateUser.firstName) ||
      toDisplayName(fallbackUser.firstName) ||
      fallbackFirstName,
    lastName:
      toDisplayName(candidateUser.lastName) ||
      toDisplayName(fallbackUser.lastName) ||
      "",
    role: normalizeUserRole(candidateUser.role) as PublicUser["role"],
  };
};

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    token: null,
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
    persistAuthState(): void {
      if (!import.meta.client) return;

      if (this.token) {
        localStorage.setItem("auth-token", this.token);
      }

      if (this.user) {
        localStorage.setItem("auth-user", JSON.stringify(this.user));
      }

      localStorage.setItem(
        "auth-isAuthenticated",
        String(this.isAuthenticated),
      );
    },

    clearAuthState(): void {
      if (!import.meta.client) return;

      localStorage.removeItem("auth-user");
      localStorage.removeItem("auth-isAuthenticated");
      localStorage.removeItem("auth-token");
      // Nettoie aussi une éventuelle persistance Pinia legacy
      localStorage.removeItem("auth");
    },

    async login(credentials: LoginRequest): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const token = await ApiService.login(credentials);

        if (!token) {
          this.error = "Email ou mot de passe incorrect";
          return false;
        }

        this.token = token;

        // Récupérer les informations utilisateur
        const user = await $fetch<PublicUser>(
          "http://localhost:8082/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        let cachedUser: Partial<PublicUser> | null = null;
        if (import.meta.client) {
          try {
            cachedUser = JSON.parse(
              localStorage.getItem("auth-user") || "null",
            );
          } catch {
            cachedUser = null;
          }
        }

        this.isAuthenticated = true;
        this.user = normalizePublicUser(user, cachedUser);
        this.persistAuthState();
        return true;
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
      this.user = normalizePublicUser(publicUser);
      this.error = null;
      this.persistAuthState();
    },

    logout(): void {
      this.isAuthenticated = false;
      this.user = null;
      this.error = null;
      this.loading = false;
      this.token = null;
      this.clearAuthState();
    },

    async initializeAuth(): Promise<void> {
      if (!import.meta.client) return;

      const savedToken = localStorage.getItem("auth-token");

      if (!savedToken) {
        this.logout();
        return;
      }

      this.token = savedToken;

      try {
        let cachedUser: Partial<PublicUser> | null = null;
        try {
          cachedUser = JSON.parse(localStorage.getItem("auth-user") || "null");
        } catch {
          cachedUser = null;
        }

        const user = await $fetch<PublicUser>(
          "http://localhost:8082/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          },
        );

        this.user = normalizePublicUser(user, cachedUser);
        this.isAuthenticated = true;
        this.error = null;
        this.persistAuthState();
      } catch {
        this.logout();
      }
    },

    async saveProfile(userData: ProfileUpdateInput): Promise<boolean> {
      if (!this.user || !this.token) {
        this.error = "Utilisateur non connecté";
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        let serverUser: Partial<PublicUser> | null = null;
        const nextEmail = (userData.email || "").trim();

        if (nextEmail && nextEmail !== this.user.email) {
          serverUser = await $fetch<Partial<PublicUser>>(
            "http://localhost:8082/api/users/me",
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
              body: {
                email: nextEmail,
              },
            },
          );
        }

        const mergedProfile = {
          ...this.user,
          ...serverUser,
          ...userData,
          email: nextEmail || this.user.email,
        } as PublicUser;

        this.user = normalizePublicUser(mergedProfile, this.user);
        this.persistAuthState();
        return true;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erreur de mise à jour";
        return false;
      } finally {
        this.loading = false;
      }
    },

    updateUser(userData: Partial<PublicUser>): void {
      if (this.user) {
        this.user = { ...this.user, ...userData };
        this.persistAuthState();
      }
    },

    clearError(): void {
      this.error = null;
    },
  },
});
