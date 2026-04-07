import { defineStore } from "pinia";
import type { Command } from "@/types/Command";
import type { Dish } from "@/types/Dish";
import { useAuthStore } from "~/stores/authentification/AuthStore";

export const useCommandStore = defineStore("command", {
  state: () => ({
    commands: [] as Command[],
  }),
  getters: {
    userCommands: (state) => {
      const authStore = useAuthStore();
      return state.commands.filter(
        (command) => command.userId === authStore.user?.id
      );
    },
  },
  actions: {
    async loadCommands() {
      try {
        const data = await $fetch<{ commands: Command[] }>("/api/data.json");
        this.commands = data.commands || [];
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        this.commands = [];
      }
    },

    async createCommand(cartItems: Dish[], restaurantId: number) {
      const authStore = useAuthStore();

      if (!authStore.user) {
        throw new Error("Utilisateur non connecté");
      }

      const newId =
        this.commands.length > 0
          ? Math.max(...this.commands.map((c) => c.id)) + 1
          : 1;

      const totalPrice = cartItems.reduce((total, item) => {
        const price = typeof item.price === "number" ? item.price : 0;
        return total + price;
      }, 0);

      const newCommand: Command = {
        id: newId,
        userId: authStore.user.id,
        restaurantId: restaurantId,
        status: "pending",
        orderDate: new Date().toISOString(),
        deliveryDate: null,
        totalPrice: Math.round(totalPrice * 100) / 100,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: 1,
          unitPrice: typeof item.price === "number" ? item.price : 0,
        })),
      };

      this.commands.push(newCommand);

      console.log("Nouvelle commande créée:", newCommand);
      return newCommand;
    },

    async saveCommandToLocalData(command: Command) {
      try {
        const data = await $fetch<any>("/api/data.json");

        if (!data.commands) {
          data.commands = [];
        }
        data.commands.push(command);

        console.log("Commande sauvegardée localement:", command);

        return true;
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        return false;
      }
    },
  },
  persist: {
    storage: process.client ? localStorage : undefined,
  },
});
