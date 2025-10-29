/** Tests unitaires pour AuthStore - Gestion de l'authentification utilisateur */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../../app/stores/authentification/AuthStore";
import type { User, PublicUser } from "../../app/types/User";
import type { LoginRequest } from "../../app/types/Api";
import { ApiService } from "../../app/services/ApiService";

vi.mock("~/services/ApiService", () => ({
  ApiService: {
    login: vi.fn(),
  },
}));

describe("AuthStore", () => {
  let authStore: ReturnType<typeof useAuthStore>;
  const mockUser: User = {
    id: 1,
    lastName: "Doe",
    firstName: "John",
    email: "john.doe@test.com",
    password: "password123",
    role: "user",
    restaurantId: undefined,
    createdAt: "2025-01-01T00:00:00.000Z",
  };

  const mockPublicUser: PublicUser = {
    id: 1,
    lastName: "Doe",
    firstName: "John",
    email: "john.doe@test.com",
    role: "user",
    restaurantId: undefined,
    createdAt: "2025-01-01T00:00:00.000Z",
  };

  const mockCredentials: LoginRequest = {
    email: "john.doe@test.com",
    password: "password123",
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
  });

  describe("État initial", () => {
    it("devrait avoir un état initial correct", () => {
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.loading).toBe(false);
      expect(authStore.error).toBeNull();
    });
  });

  describe("Getters", () => {
    beforeEach(() => {
      authStore.user = mockPublicUser;
      authStore.isAuthenticated = true;
    });

    it("isAuth devrait retourner le statut d'authentification", () => {
      expect(authStore.isAuth).toBe(true);
    });

    it("currentUser devrait retourner l'utilisateur actuel", () => {
      expect(authStore.currentUser).toEqual(mockPublicUser);
    });

    it("hasRole devrait vérifier le rôle correct", () => {
      expect(authStore.hasRole("user")).toBe(true);
      expect(authStore.hasRole("admin")).toBe(false);
      expect(authStore.hasRole("restaurateur")).toBe(false);
    });

    it("isAdmin devrait retourner false pour un utilisateur normal", () => {
      expect(authStore.isAdmin).toBe(false);
    });

    it("isRestaurateur devrait retourner false pour un utilisateur normal", () => {
      expect(authStore.isRestaurateur).toBe(false);
    });

    it("isUser devrait retourner true pour un utilisateur normal", () => {
      expect(authStore.isUser).toBe(true);
    });

    it("devrait gérer un utilisateur admin", () => {
      authStore.user = { ...mockPublicUser, role: "admin" };

      expect(authStore.isAdmin).toBe(true);
      expect(authStore.isRestaurateur).toBe(false);
      expect(authStore.isUser).toBe(false);
      expect(authStore.hasRole("admin")).toBe(true);
    });

    it("devrait gérer un restaurateur", () => {
      authStore.user = { ...mockPublicUser, role: "restaurateur" };

      expect(authStore.isAdmin).toBe(false);
      expect(authStore.isRestaurateur).toBe(true);
      expect(authStore.isUser).toBe(false);
      expect(authStore.hasRole("restaurateur")).toBe(true);
    });
  });

  describe("Action login", () => {
    it("devrait connecter un utilisateur avec succès", async () => {
      vi.mocked(ApiService.login).mockResolvedValue(mockPublicUser);

      const result = await authStore.login(mockCredentials);

      expect(result).toBe(true);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(mockPublicUser);
      expect(authStore.error).toBeNull();
      expect(authStore.loading).toBe(false);
      expect(ApiService.login).toHaveBeenCalledWith(mockCredentials);
    });

    it("devrait gérer un échec de connexion (utilisateur null)", async () => {
      vi.mocked(ApiService.login).mockResolvedValue(null);

      const result = await authStore.login(mockCredentials);

      expect(result).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.error).toBe("Email ou mot de passe incorrect");
      expect(authStore.loading).toBe(false);
    });

    it("devrait gérer les erreurs du service API", async () => {
      const errorMessage = "Erreur réseau";
      vi.mocked(ApiService.login).mockRejectedValue(new Error(errorMessage));

      const result = await authStore.login(mockCredentials);

      expect(result).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.error).toBe(errorMessage);
      expect(authStore.loading).toBe(false);
    });

    it("devrait gérer les erreurs non-Error", async () => {
      vi.mocked(ApiService.login).mockRejectedValue("Erreur inconnue");

      const result = await authStore.login(mockCredentials);

      expect(result).toBe(false);
      expect(authStore.error).toBe("Erreur de connexion");
    });

    it("devrait gérer l'état de chargement", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(ApiService.login).mockReturnValue(promise);

      const loginPromise = authStore.login(mockCredentials);

      expect(authStore.loading).toBe(true);

      resolvePromise!(mockPublicUser);
      await loginPromise;

      expect(authStore.loading).toBe(false);
    });
  });

  describe("Action loginUser", () => {
    it("devrait connecter directement un utilisateur", () => {
      authStore.loginUser(mockUser);

      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(mockPublicUser);
      expect(authStore.user).not.toHaveProperty("password");
      expect(authStore.user?.id).toBe(mockUser.id);
      expect(authStore.user?.email).toBe(mockUser.email);
    });
  });

  describe("Action logout", () => {
    it("devrait déconnecter l'utilisateur", () => {
      authStore.isAuthenticated = true;
      authStore.user = mockPublicUser;
      authStore.error = "Une erreur";
      authStore.loading = true;

      authStore.logout();

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.error).toBeNull();
      expect(authStore.loading).toBe(false);
    });
  });

  describe("Action updateUser", () => {
    beforeEach(() => {
      authStore.user = mockPublicUser;
      authStore.isAuthenticated = true;
    });

    it("devrait mettre à jour les données utilisateur", () => {
      const updates = {
        lastName: "Smith",
        restaurantId: 2,
      };

      authStore.updateUser(updates);

      expect(authStore.user?.lastName).toBe("Smith");
      expect(authStore.user?.restaurantId).toBe(2);
      expect(authStore.user?.email).toBe(mockPublicUser.email);
    });

    it("ne devrait rien faire si aucun utilisateur n'est connecté", () => {
      authStore.user = null;

      authStore.updateUser({ lastName: "Smith" });

      expect(authStore.user).toBeNull();
    });
  });

  describe("Action clearError", () => {
    it("devrait effacer les erreurs", () => {
      authStore.error = "Une erreur";

      authStore.clearError();

      expect(authStore.error).toBeNull();
    });
  });
});
