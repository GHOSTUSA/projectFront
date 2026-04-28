import { describe, it, expect, beforeEach, vi } from "vitest";
import AuthService from "../../services/auth.service.js";
import { ConflictError, UnauthorizedError } from "../../common/exceptions.js";
import { hash } from "bcryptjs";

describe("Auth Service - Unit Tests", () => {
  let prisma: any;
  let authService: AuthService;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    vi.clearAllMocks();

    // Créer un mock de Prisma
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    authService = new AuthService(prisma);
  });

  describe("register", () => {
    it("devrait enregistrer un nouvel utilisateur avec un email valide", async () => {
      const input = {
        email: "newuser@example.com",
        password: "password123",
      };

      //pas d'utilisateur existant
      prisma.user.findUnique.mockResolvedValue(null);

      // resultat de la creation du user
      prisma.user.create.mockResolvedValue({
        id: "user-123",
        email: input.email,
        password: expect.any(String), // N'importe quel string (le hash)
        role: "USER",
      });

      //appel de la fonction de register avec les infos user
      const result = await authService.register(input);

      //verifier le resultat
      expect(result).toEqual({
        id: "user-123",
        email: "newuser@example.com",
        role: "USER",
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it("devrait lancer une ConflictError si l'email existe déjà", async () => {
      // ARRANGE
      const input = {
        email: "existing@example.com",
        password: "password123",
      };
      // Mock findUnique pour retourner un utilisateur existant
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: input.email,
        password: "hashedpassword",
        role: "USER",
      });
      // ACT & ASSERT
      await expect(authService.register(input)).rejects.toThrow(ConflictError);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("devrait loguer un utilisateur avec des identifiants valides", async () => {
      // ARRANGE
      const input = {
        email: "user@example.com",
        password: "password123",
      };
      const hashedPassword = await hash(input.password, 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-456",
        email: "user@example.com",
        password: hashedPassword,
        role: "USER",
      });
      // ACT
      const result = await authService.login(input);
      // ASSERT
      expect(result).toEqual({
        id: "user-456",
        email: "user@example.com",
        role: "USER",
      });
    });

    it("devrait lancer une UnauthorizedError si l'utilisateur n'existe pas", async () => {
      const input = {
        email: "nonexistent@example.com",
        password: "password123",
      };
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    });

    it("devrait lancer une UnauthorizedError si le mot de passe est incorrect", async () => {
      const input = {
        email: "user@example.com",
        password: "wrongpassword",
      };
      // hash d'un autre mot de passe
      const hashedPassword = await hash("password123", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-789",
        email: "user@example.com",
        password: hashedPassword,
        role: "USER",
      });
      await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    });
  });
});
