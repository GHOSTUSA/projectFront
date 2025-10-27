/**
 * Interface représentant un plat dans le système
 * Contient toutes les informations nutritionnelles et commerciales
 */
export interface Dish {
  /** Identifiant unique du plat */
  id: number;

  /** Nom commercial du plat */
  name: string;

  /** Description détaillée du plat et de sa préparation */
  description: string;

  /**
   * Prix du plat en euros
   * Toujours stocké avec 2 décimales maximum
   */
  price: number;

  /** Catégorie du plat (ex: "Entrée", "Plat", "Dessert", "Boisson") */
  category: string;

  /** URL de l'image du plat */
  image: string;

  /**
   * Liste des allergènes présents dans le plat
   * Conforme aux réglementations européennes
   */
  allergens: string[];

  /**
   * ID du restaurant proposant ce plat
   * Permet de lier le plat à son établissement d'origine
   */
  restaurantId?: number;
}

/**
 * Type pour les données essentielles d'un plat
 * Utilisé dans les cartes de présentation et le panier
 */
export type DishSummary = Pick<Dish, "id" | "name" | "price" | "image">;

/**
 * Type pour la création d'un nouveau plat
 * Exclut l'ID auto-généré
 */
export type CreateDishData = Omit<Dish, "id">;

/**
 * Type pour la mise à jour d'un plat
 * Tous les champs sont optionnels sauf l'ID
 */
export type UpdateDishData = Partial<Omit<Dish, "id">> & { id: number };

/**
 * Type pour un élément du panier
 * Étend le plat avec des informations de quantité
 */
export interface CartItem extends Dish {
  /** Quantité commandée de ce plat */
  quantity: number;

  /** Prix total pour cette quantité (price * quantity) */
  totalPrice: number;
}
