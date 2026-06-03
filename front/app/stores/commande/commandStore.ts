import { defineStore } from "pinia";
import type { Command } from "@/types/Command";
import type { Dish } from "@/types/Dish";
import { useAuthStore } from "~/stores/authentification/AuthStore";

type ApiOrder = {
  id: string | number;
  userId: string | number;
  restaurantId: string | number;
  status: string;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
  items?: Array<{
    dishId: string | number;
    quantity: number;
    price: number;
  }>;
};

const mapOrderStatus = (status?: string): Command["status"] => {
  const normalized = (status || "").toUpperCase();

  if (normalized === "DELIVERED") return "delivered";
  if (normalized === "CANCELLED") return "cancelled";
  if (["CONFIRMED", "PREPARING", "READY"].includes(normalized)) {
    return "in-progress";
  }

  return "pending";
};

const mapApiOrderToCommand = (order: ApiOrder): Command => ({
  id: order.id,
  userId: order.userId,
  restaurantId: order.restaurantId,
  status: mapOrderStatus(order.status),
  orderDate: order.createdAt || new Date().toISOString(),
  deliveryDate:
    mapOrderStatus(order.status) === "delivered"
      ? order.updatedAt || null
      : null,
  totalPrice: Number(order.totalPrice || 0),
  items: (order.items || []).map((item) => ({
    productId: item.dishId,
    quantity: item.quantity,
    unitPrice: Number(item.price || 0),
  })),
});

export const useCommandStore = defineStore("command", {
  state: () => ({
    commands: [] as Command[],
  }),
  getters: {
    userCommands: (state) => {
      const authStore = useAuthStore();
      return state.commands.filter(
        (command) => String(command.userId) === String(authStore.user?.id),
      );
    },
  },
  actions: {
    async loadCommands() {
      const authStore = useAuthStore();

      try {
        if (!authStore.token) {
          this.commands = [];
          return;
        }

        const endpoint =
          authStore.user?.role === "restaurateur"
            ? "http://localhost:8082/api/orders/restaurant"
            : "http://localhost:8082/api/orders/me";

        const orders = await $fetch<ApiOrder[]>(endpoint, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        this.commands = orders.map(mapApiOrderToCommand);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        this.commands = [];
      }
    },

    async createCommand(cartItems: Dish[], restaurantId: number) {
      const authStore = useAuthStore();

      if (!authStore.user || !authStore.token) {
        throw new Error("Utilisateur non connecté");
      }

      // Préparer le payload attendu par l'API
      const payload = {
        restaurantId: String(restaurantId),
        items: cartItems.map((item) => ({
          dishId: String(item.id),
          quantity: item.quantity || 1,
        })),
      };

      try {
        const created = await $fetch<ApiOrder>(
          "http://localhost:8082/api/orders",
          {
            method: "POST",
            body: payload,
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );

        // Mettre à jour le store local si nécessaire
        if (created) {
          this.commands.unshift(mapApiOrderToCommand(created));
        }

        return mapApiOrderToCommand(created);
      } catch (error) {
        console.error(
          "Erreur lors de la création de la commande sur le back:",
          error,
        );
        throw error;
      }
    },

    async saveCommandToLocalData(command: Command) {
      // À remplacer par un POST réel sur l'API back si besoin
      try {
        const authStore = useAuthStore();
        if (authStore.token) {
          await $fetch("http://localhost:8082/api/orders", {
            method: "POST",
            body: command,
            headers: { Authorization: `Bearer ${authStore.token}` },
          });
          console.log("Commande sauvegardée sur le back:", command);
          return true;
        }

        // No token: push locally as fallback
        this.commands.push(command);
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
