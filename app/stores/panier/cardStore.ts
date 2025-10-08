import { defineStore } from "pinia";
import type { Dish } from "@/types/Dish";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as Dish[],
  }),
  getters: {
    cartItemCount: (state) => state.items.length,
    cartItems: (state) => state.items,
    cartPrice: (state) => {
      const total = state.items.reduce((total, item) => {
        const price = typeof item.price === "number" ? item.price : 0;
        return total + price;
      }, 0);
      return Math.round(total * 100) / 100;
    },
  },
  actions: {
    addToCart(dish: Dish) {
      this.items.push(dish);
    },
    removeFromCart(dish: Dish) {
      const index = this.items.findIndex((item) => item.id === dish.id);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    },
    clearCart() {
      this.items = [];
    },
  },
  persist: true,
});
