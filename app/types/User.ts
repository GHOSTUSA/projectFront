import type { Command } from "./Command";

/**
 * Interface représentant un utilisateur du système
 * Gère les trois types de rôles : admin, user, restaurateur
 */
export interface User {
  /** Identifiant unique de l'utilisateur */
  id: number;

  /** Nom de famille de l'utilisateur */
  lastName: string;

  /** Prénom de l'utilisateur */
  firstName: string;

  /** Adresse email unique pour l'authentification */
  email: string;

  /** Mot de passe hashé (à ne jamais exposer côté client) */
  password: string;

  /**
   * Rôle déterminant les permissions d'accès
   * - admin: Accès complet au back-office
   * - restaurateur: Gestion d'un restaurant spécifique
   * - user: Client standard avec commandes
   */
  role: "admin" | "user" | "restaurateur";

  /**
   * ID du restaurant géré (obligatoire pour les restaurateurs)
   * Permet de lier un restaurateur à son établissement
   */
  restaurantId?: number;

  /** Date de création du compte au format ISO */
  createdAt: string;

  /** Historique des commandes de l'utilisateur */
  commands?: Command[];
}

/**
 * Type pour les données publiques d'un utilisateur (sans password)
 * Utilisé pour les réponses API et l'affichage
 */
export type PublicUser = Omit<User, "password">;

/**
 * Type pour la création d'un nouvel utilisateur
 * Exclut les champs auto-générés
 */
export type CreateUserData = Omit<User, "id" | "createdAt" | "commands">;

/**
 * Type pour la mise à jour des informations utilisateur
 * Tous les champs sont optionnels sauf l'ID
 */
export type UpdateUserData = Partial<Omit<User, "id">> & { id: number };
