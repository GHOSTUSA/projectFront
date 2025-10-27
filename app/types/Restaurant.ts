import type { Dish } from "./Dish";

/**
 * Interface représentant un restaurant dans le système
 * Contient toutes les informations nécessaires à l'affichage et la gestion
 */
export interface Restaurant {
  /** Identifiant unique du restaurant */
  id: number;

  /** Nom commercial du restaurant */
  name: string;

  /** Adresse complète de l'établissement */
  address: string;

  /** Numéro de téléphone pour contact */
  phone: string;

  /** Type de cuisine proposée (ex: "Italien", "Français", "Asiatique") */
  cuisineType: string;

  /**
   * Note moyenne du restaurant (0-5)
   * Calculée à partir des avis clients
   */
  averageRating: number;

  /** URL de l'image de présentation du restaurant */
  image: string;

  /** Liste des plats proposés par le restaurant */
  dishes: Dish[];
}

/**
 * Type pour les données minimales d'un restaurant
 * Utilisé dans les listes et cartes de présentation
 */
export type RestaurantSummary = Pick<
  Restaurant,
  "id" | "name" | "cuisineType" | "averageRating" | "image"
>;

/**
 * Type pour la création d'un nouveau restaurant
 * Exclut l'ID auto-généré et initialise avec un tableau de plats vide
 */
export type CreateRestaurantData = Omit<Restaurant, "id" | "dishes"> & {
  dishes?: Dish[];
};

/**
 * Type pour la mise à jour d'un restaurant
 * Tous les champs sont optionnels sauf l'ID
 */
export type UpdateRestaurantData = Partial<Omit<Restaurant, "id">> & {
  id: number;
};
