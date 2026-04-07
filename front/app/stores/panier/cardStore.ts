/* Store Pinia pour la gestion du panier d'achat avec authentification */
import { defineStore } from "pinia";
import type { Dish, CartItem } from "@/types/Dish";
import { useAuthStore } from "@/stores/authentification/AuthStore";

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

function dishToCartItem(dish: Dish, quantity: number = 1): CartItem {
  return {
    ...dish,
    quantity,
    totalPrice: Number((dish.price * quantity).toFixed(2)),
  };
}

export const useCartStore = defineStore("cart", {
  state: (): CartState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    cartItemCount: (state): number => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },
    cartItems: (state): CartItem[] => state.items,
    cartPrice: (state): number => {
      const total = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      return Number(total.toFixed(2));
    },
    isEmpty: (state): boolean => state.items.length === 0,
    getItemQuantity:
      (state) =>
      (dishId: number): number => {
        const item = state.items.find((item) => item.id === dishId);
        return item?.quantity || 0;
      },
    hasItem:
      (state) =>
      (dishId: number): boolean => {
        return state.items.some((item) => item.id === dishId);
      },
    uniqueItemsCount: (state): number => state.items.length,
  },

  actions: {
    addToCart(dish: Dish, quantity: number = 1): void {
      const authStore = useAuthStore();
      if (!authStore.isAuth) {
        this.error =
          "Vous devez être connecté pour ajouter des articles au panier";
        return;
      }

      this.error = null;
      const existingItemIndex = this.items.findIndex(
        (item) => item.id === dish.id
      );
      if (existingItemIndex !== -1) {
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
        this.items.push(dishToCartItem(dish, quantity));
      }
    },

    removeFromCart(dish: Dish): void {
      this.error = null;
      const authStore = useAuthStore();
      if (!authStore.isAuth) {
        this.error = "Vous devez être connecté pour modifier votre panier";
        return;
      }
      const index = this.items.findIndex((item) => item.id === dish.id);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },

    updateItemQuantity(dishId: number, quantity: number): void {
      this.error = null;
      const authStore = useAuthStore();
      if (!authStore.isAuth) {
        this.error = "Vous devez être connecté pour modifier votre panier";
        return;
      }
      if (quantity <= 0) {
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

    decrementItem(dishId: number): void {
      const authStore = useAuthStore();
      if (!authStore.isAuth) {
        this.error = "Vous devez être connecté pour modifier votre panier";
        return;
      }
      const item = this.items.find((item) => item.id === dishId);
      if (item) {
        this.updateItemQuantity(dishId, item.quantity - 1);
      }
    },

    incrementItem(dishId: number): void {
      const authStore = useAuthStore();
      if (!authStore.isAuth) {
        this.error = "Vous devez être connecté pour modifier votre panier";
        return;
      }
      const item = this.items.find((item) => item.id === dishId);
      if (item) {
        this.updateItemQuantity(dishId, item.quantity + 1);
      }
    },

    clearCart(): void {
      const authStore = useAuthStore();
      if (!authStore.isAuth) {
        this.error = "Vous devez être connecté pour modifier votre panier";
        return;
      }
      this.items = [];
      this.error = null;
    },

    clearError(): void {
      this.error = null;
    },

    validateSameRestaurant(): boolean {
      if (this.items.length === 0) return true;
      const firstItem = this.items[0];
      if (!firstItem) return true;
      const firstRestaurantId = firstItem.restaurantId;
      return this.items.every(
        (item) => item.restaurantId === firstRestaurantId
      );
    },

    getCartRestaurantId(): number | null {
      const firstItem = this.items[0];
      return firstItem ? firstItem.restaurantId || null : null;
    },
  },
  persist: true,
});
