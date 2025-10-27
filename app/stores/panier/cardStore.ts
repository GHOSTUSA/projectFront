import { defineStore } from "pinia";
import type { Dish, CartItem } from "@/types/Dish";

/**
 * Interface pour l'état du store du panier
 * Définit la structure des données du panier d'achat
 */
interface CartState {
  /** Liste des articles dans le panier */
  items: CartItem[];

  /** État de chargement pour les opérations sur le panier */
  loading: boolean;

  /** Message d'erreur en cas de problème */
  error: string | null;
}

/**
 * Utilitaire pour convertir un Dish en CartItem
 * @param dish - Le plat à ajouter
 * @param quantity - Quantité (défaut: 1)
 * @returns CartItem avec quantité et prix total
 */
function dishToCartItem(dish: Dish, quantity: number = 1): CartItem {
  return {
    ...dish,
    quantity,
    totalPrice: Number((dish.price * quantity).toFixed(2)),
  };
}

/**
 * Store Pinia pour la gestion du panier d'achat
 * Gère l'ajout, suppression et calculs des articles
 */
export const useCartStore = defineStore("cart", {
  state: (): CartState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Nombre total d'articles dans le panier
     * @returns number - somme des quantités
     */
    cartItemCount: (state): number => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Liste des articles du panier
     * @returns CartItem[] - articles avec quantités
     */
    cartItems: (state): CartItem[] => state.items,

    /**
     * Prix total du panier
     * @returns number - somme des prix avec 2 décimales
     */
    cartPrice: (state): number => {
      const total = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      return Number(total.toFixed(2));
    },

    /**
     * Vérifie si le panier est vide
     * @returns boolean
     */
    isEmpty: (state): boolean => state.items.length === 0,

    /**
     * Récupère la quantité d'un plat spécifique dans le panier
     * @returns fonction qui prend un ID de plat et retourne la quantité
     */
    getItemQuantity:
      (state) =>
      (dishId: number): number => {
        const item = state.items.find((item) => item.id === dishId);
        return item?.quantity || 0;
      },

    /**
     * Vérifie si un plat est dans le panier
     * @returns fonction qui prend un ID de plat et retourne boolean
     */
    hasItem:
      (state) =>
      (dishId: number): boolean => {
        return state.items.some((item) => item.id === dishId);
      },

    /**
     * Nombre de types d'articles différents (pas la quantité totale)
     * @returns number
     */
    uniqueItemsCount: (state): number => state.items.length,
  },

  actions: {
    /**
     * Ajoute un plat au panier ou augmente sa quantité
     * @param dish - Le plat à ajouter
     * @param quantity - Quantité à ajouter (défaut: 1)
     */
    addToCart(dish: Dish, quantity: number = 1): void {
      this.error = null;

      const existingItemIndex = this.items.findIndex(
        (item) => item.id === dish.id
      );

      if (existingItemIndex !== -1) {
        // Article déjà présent, augmenter la quantité
        const existingItem = this.items[existingItemIndex];
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;

          this.items[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            totalPrice: Number((existingItem.price * newQuantity).toFixed(2)),
          };
        }
      } else {
        // Nouvel article
        this.items.push(dishToCartItem(dish, quantity));
      }
    },

    /**
     * Retire un plat du panier complètement
     * @param dish - Le plat à retirer
     */
    removeFromCart(dish: Dish): void {
      this.error = null;
      const index = this.items.findIndex((item) => item.id === dish.id);

      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },

    /**
     * Met à jour la quantité d'un article spécifique
     * @param dishId - ID du plat
     * @param quantity - Nouvelle quantité (0 = retirer l'article)
     */
    updateItemQuantity(dishId: number, quantity: number): void {
      this.error = null;

      if (quantity <= 0) {
        // Retirer l'article si quantité <= 0
        const index = this.items.findIndex((item) => item.id === dishId);
        if (index !== -1) {
          this.items.splice(index, 1);
        }
        return;
      }

      const itemIndex = this.items.findIndex((item) => item.id === dishId);
      if (itemIndex !== -1) {
        const item = this.items[itemIndex];
        if (item) {
          this.items[itemIndex] = {
            ...item,
            quantity,
            totalPrice: Number((item.price * quantity).toFixed(2)),
          };
        }
      }
    },

    /**
     * Diminue la quantité d'un article de 1
     * @param dishId - ID du plat
     */
    decrementItem(dishId: number): void {
      const item = this.items.find((item) => item.id === dishId);
      if (item) {
        this.updateItemQuantity(dishId, item.quantity - 1);
      }
    },

    /**
     * Augmente la quantité d'un article de 1
     * @param dishId - ID du plat
     */
    incrementItem(dishId: number): void {
      const item = this.items.find((item) => item.id === dishId);
      if (item) {
        this.updateItemQuantity(dishId, item.quantity + 1);
      }
    },

    /**
     * Vide complètement le panier
     */
    clearCart(): void {
      this.items = [];
      this.error = null;
    },

    /**
     * Efface les erreurs du panier
     */
    clearError(): void {
      this.error = null;
    },

    /**
     * Valide que tous les articles du panier sont du même restaurant
     * @returns boolean - true si valide ou panier vide
     */
    validateSameRestaurant(): boolean {
      if (this.items.length === 0) return true;

      const firstItem = this.items[0];
      if (!firstItem) return true;

      const firstRestaurantId = firstItem.restaurantId;
      return this.items.every(
        (item) => item.restaurantId === firstRestaurantId
      );
    },

    /**
     * Récupère l'ID du restaurant des articles du panier
     * @returns number | null - ID du restaurant ou null si panier vide
     */
    getCartRestaurantId(): number | null {
      const firstItem = this.items[0];
      return firstItem ? firstItem.restaurantId || null : null;
    },
  },

  /**
   * Configuration de la persistance
   * Sauvegarde le panier dans localStorage
   */
  persist: true,
});
