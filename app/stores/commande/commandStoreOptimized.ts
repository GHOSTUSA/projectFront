import { defineStore } from "pinia";
import type { Command, CommandStatus } from "~/types/Command";
import type { Restaurant } from "~/types/Restaurant";
import type { Dish } from "~/types/Dish";

/**
 * Interface pour les statistiques de commandes
 */
interface CommandStats {
  total: number;
  byStatus: Record<CommandStatus, number>;
  totalRevenue: number;
  averageOrderValue: number;
  topRestaurants: Array<{
    restaurant: Restaurant;
    orderCount: number;
    revenue: number;
  }>;
  recentOrders: Command[];
}

/**
 * Store global pour la gestion des commandes
 * Fonctionnalités: cache intelligent, filtres avancés, statistiques temps réel
 */
export const useCommandStore = defineStore("command", {
  state: () => ({
    /** Cache des commandes */
    commands: [] as Command[],

    /** Commande actuellement sélectionnée */
    currentCommand: null as Command | null,

    /** États de chargement */
    loading: {
      commands: false,
      currentCommand: false,
      updating: false,
    },

    /** Gestion des erreurs */
    errors: {
      commands: null as string | null,
      currentCommand: null as string | null,
      updating: null as string | null,
    },

    /** Métadonnées de cache */
    cache: {
      commandsLastFetch: null as Date | null,
      commandsTtl: 2 * 60 * 1000, // 2 minutes TTL pour les commandes (données plus volatiles)
    },

    /** Filtres et recherche */
    filters: {
      searchQuery: "",
      status: "" as CommandStatus | "",
      restaurantId: "",
      userId: "",
      dateFrom: "",
      dateTo: "",
      minAmount: 0,
      maxAmount: 0,
      sortBy: "orderDate" as "orderDate" | "totalAmount" | "status",
      sortOrder: "desc" as "asc" | "desc",
    },
  }),

  getters: {
    /**
     * Commandes filtrées selon les critères actuels
     */
    filteredCommands: (state): Command[] => {
      let filtered = [...state.commands];

      // Filtre par recherche textuelle (ID commande, restaurant, adresse)
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (command) =>
            String(command.id).includes(query) ||
            command.restaurant.name.toLowerCase().includes(query) ||
            command.deliveryAddress.toLowerCase().includes(query)
        );
      }

      // Filtre par statut
      if (state.filters.status) {
        filtered = filtered.filter(
          (command) => command.status === state.filters.status
        );
      }

      // Filtre par restaurant
      if (state.filters.restaurantId) {
        filtered = filtered.filter(
          (command) =>
            String(command.restaurant.id) === state.filters.restaurantId
        );
      }

      // Filtre par utilisateur
      if (state.filters.userId) {
        filtered = filtered.filter(
          (command) => String(command.user.id) === state.filters.userId
        );
      }

      // Filtre par montant
      if (state.filters.minAmount > 0) {
        filtered = filtered.filter(
          (command) => command.totalAmount >= state.filters.minAmount
        );
      }
      if (state.filters.maxAmount > 0) {
        filtered = filtered.filter(
          (command) => command.totalAmount <= state.filters.maxAmount
        );
      }

      // Filtre par date
      if (state.filters.dateFrom) {
        const fromDate = new Date(state.filters.dateFrom);
        filtered = filtered.filter(
          (command) => new Date(command.orderDate) >= fromDate
        );
      }
      if (state.filters.dateTo) {
        const toDate = new Date(state.filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Fin de journée
        filtered = filtered.filter(
          (command) => new Date(command.orderDate) <= toDate
        );
      }

      // Tri
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (state.filters.sortBy) {
          case "totalAmount":
            aValue = a.totalAmount;
            bValue = b.totalAmount;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            aValue = new Date(a.orderDate);
            bValue = new Date(b.orderDate);
        }

        if (aValue instanceof Date) {
          aValue = aValue.getTime();
          bValue = bValue.getTime();
        }

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return state.filters.sortOrder === "desc" ? -comparison : comparison;
      });

      return filtered;
    },

    /**
     * Statistiques complètes des commandes
     */
    commandStats: (state): CommandStats => {
      const commands = state.commands;
      const total = commands.length;

      // Statistiques par statut
      const byStatus = commands.reduce((acc, command) => {
        acc[command.status] = (acc[command.status] || 0) + 1;
        return acc;
      }, {} as Record<CommandStatus, number>);

      // Chiffre d'affaires total
      const totalRevenue = commands.reduce(
        (sum, command) => sum + command.totalAmount,
        0
      );

      // Panier moyen
      const averageOrderValue = total > 0 ? totalRevenue / total : 0;

      // Top restaurants par commandes
      const restaurantStats = commands.reduce((acc, command) => {
        const restId = String(command.restaurant.id);
        if (!acc[restId]) {
          acc[restId] = {
            restaurant: command.restaurant,
            orderCount: 0,
            revenue: 0,
          };
        }
        acc[restId].orderCount++;
        acc[restId].revenue += command.totalAmount;
        return acc;
      }, {} as Record<string, { restaurant: Restaurant; orderCount: number; revenue: number }>);

      const topRestaurants = Object.values(restaurantStats)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 10);

      // Commandes récentes (7 derniers jours)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentOrders = commands
        .filter((command) => new Date(command.orderDate) >= weekAgo)
        .sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        )
        .slice(0, 20);

      return {
        total,
        byStatus: {
          pending: byStatus.pending || 0,
          confirmed: byStatus.confirmed || 0,
          preparing: byStatus.preparing || 0,
          ready: byStatus.ready || 0,
          delivering: byStatus.delivering || 0,
          delivered: byStatus.delivered || 0,
          cancelled: byStatus.cancelled || 0,
        },
        totalRevenue,
        averageOrderValue,
        topRestaurants,
        recentOrders,
      };
    },

    /**
     * Commandes par utilisateur
     */
    getCommandsByUserId: (state) => {
      return (userId: string | number): Command[] => {
        return state.commands
          .filter((command) => String(command.user.id) === String(userId))
          .sort(
            (a, b) =>
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );
      };
    },

    /**
     * Commandes par restaurant
     */
    getCommandsByRestaurantId: (state) => {
      return (restaurantId: string | number): Command[] => {
        return state.commands
          .filter(
            (command) => String(command.restaurant.id) === String(restaurantId)
          )
          .sort(
            (a, b) =>
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );
      };
    },

    /**
     * Commande par ID
     */
    getCommandById: (state) => {
      return (id: string | number): Command | undefined => {
        return state.commands.find(
          (command) => String(command.id) === String(id)
        );
      };
    },

    /**
     * Vérifie si le cache est valide
     */
    isCacheValid: (state): boolean => {
      if (!state.cache.commandsLastFetch) return false;

      const now = new Date();
      const elapsed = now.getTime() - state.cache.commandsLastFetch.getTime();
      return elapsed < state.cache.commandsTtl;
    },

    /**
     * État de chargement global
     */
    isLoading: (state): boolean => {
      return Object.values(state.loading).some(Boolean);
    },

    /**
     * Erreurs actives
     */
    hasErrors: (state): boolean => {
      return Object.values(state.errors).some(Boolean);
    },

    /**
     * Statuts disponibles pour les filtres
     */
    availableStatuses: (): CommandStatus[] => {
      return [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivering",
        "delivered",
        "cancelled",
      ];
    },
  },

  actions: {
    /**
     * Charge toutes les commandes avec cache intelligent
     */
    async fetchCommands(forceRefresh = false): Promise<Command[]> {
      // Vérification du cache si pas de rafraîchissement forcé
      if (!forceRefresh && this.isCacheValid && this.commands.length > 0) {
        console.log("🎯 Commandes chargées depuis le cache");
        return this.commands;
      }

      this.loading.commands = true;
      this.errors.commands = null;

      try {
        const data = await $fetch<{ commands: Command[] }>("/api/data.json");

        this.commands = data.commands || [];
        this.cache.commandsLastFetch = new Date();

        console.log(
          `✅ ${this.commands.length} commandes chargées et mises en cache`
        );
        return this.commands;
      } catch (error) {
        const errorMessage = "Erreur lors du chargement des commandes";
        this.errors.commands = errorMessage;
        console.error("❌", errorMessage, error);
        throw error;
      } finally {
        this.loading.commands = false;
      }
    },

    /**
     * Charge une commande spécifique par ID
     */
    async fetchCommandById(id: string | number): Promise<Command> {
      // Vérification dans le cache local d'abord
      const cachedCommand = this.getCommandById(id);
      if (cachedCommand) {
        this.currentCommand = cachedCommand;
        console.log(`🎯 Commande ${id} chargée depuis le cache`);
        return cachedCommand;
      }

      this.loading.currentCommand = true;
      this.errors.currentCommand = null;

      try {
        // Si pas en cache, charger toutes les commandes
        await this.fetchCommands();

        const command = this.getCommandById(id);
        if (!command) {
          throw new Error(`Commande avec l'ID ${id} introuvable`);
        }

        this.currentCommand = command;
        console.log(`✅ Commande ${id} chargée`);
        return command;
      } catch (error) {
        const errorMessage = `Erreur lors du chargement de la commande ${id}`;
        this.errors.currentCommand = errorMessage;
        console.error("❌", errorMessage, error);
        throw error;
      } finally {
        this.loading.currentCommand = false;
      }
    },

    /**
     * Met à jour le statut d'une commande
     */
    async updateCommandStatus(
      commandId: string | number,
      newStatus: CommandStatus
    ): Promise<Command> {
      this.loading.updating = true;
      this.errors.updating = null;

      try {
        // Simulation d'appel API - à remplacer par vraie API
        console.log(
          `🔄 Mise à jour commande ${commandId} vers statut ${newStatus}`
        );

        // Mise à jour locale immédiate (optimistic update)
        const commandIndex = this.commands.findIndex(
          (c) => String(c.id) === String(commandId)
        );
        if (commandIndex !== -1) {
          this.commands[commandIndex].status = newStatus;

          // Mise à jour de la commande courante si c'est la même
          if (
            this.currentCommand &&
            String(this.currentCommand.id) === String(commandId)
          ) {
            this.currentCommand.status = newStatus;
          }
        }

        // Ici, on ferait l'appel API réel
        // await $fetch(`/api/commands/${commandId}/status`, {
        //   method: 'PUT',
        //   body: { status: newStatus }
        // });

        console.log(
          `✅ Statut de la commande ${commandId} mis à jour: ${newStatus}`
        );
        return this.commands[commandIndex];
      } catch (error) {
        const errorMessage = `Erreur lors de la mise à jour de la commande ${commandId}`;
        this.errors.updating = errorMessage;
        console.error("❌", errorMessage, error);
        throw error;
      } finally {
        this.loading.updating = false;
      }
    },

    /**
     * Crée une nouvelle commande
     */
    async createCommand(commandData: Partial<Command>): Promise<Command> {
      this.loading.updating = true;
      this.errors.updating = null;

      try {
        // Simulation de création - à remplacer par vraie API
        const newCommand: Command = {
          id: Date.now(), // ID temporaire
          orderDate: new Date().toISOString(),
          status: "pending",
          totalAmount: 0,
          deliveryAddress: "",
          user: { id: 0, name: "", email: "" },
          restaurant: {
            id: 0,
            name: "",
            cuisineType: "",
            address: "",
            phone: "",
            image: "",
            averageRating: 0,
            dishes: [],
          },
          dishes: [],
          ...(commandData as Command),
        };

        // Ajout local
        this.commands.unshift(newCommand);
        this.invalidateCache(); // Force rechargement au prochain fetch

        console.log(`✅ Nouvelle commande créée: ${newCommand.id}`);
        return newCommand;
      } catch (error) {
        const errorMessage = "Erreur lors de la création de la commande";
        this.errors.updating = errorMessage;
        console.error("❌", errorMessage, error);
        throw error;
      } finally {
        this.loading.updating = false;
      }
    },

    /**
     * Met à jour les filtres
     */
    updateFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
      console.log("🔍 Filtres commandes mis à jour:", this.filters);
    },

    /**
     * Réinitialise les filtres
     */
    resetFilters() {
      this.filters = {
        searchQuery: "",
        status: "",
        restaurantId: "",
        userId: "",
        dateFrom: "",
        dateTo: "",
        minAmount: 0,
        maxAmount: 0,
        sortBy: "orderDate",
        sortOrder: "desc",
      };
      console.log("🔄 Filtres commandes réinitialisés");
    },

    /**
     * Vide le cache et force un rechargement
     */
    invalidateCache() {
      this.cache.commandsLastFetch = null;
      console.log("🧹 Cache commandes invalidé");
    },

    /**
     * Nettoie les erreurs
     */
    clearErrors() {
      this.errors = {
        commands: null,
        currentCommand: null,
        updating: null,
      };
    },

    /**
     * Réinitialise complètement le store
     */
    $reset() {
      this.commands = [];
      this.currentCommand = null;
      this.loading = {
        commands: false,
        currentCommand: false,
        updating: false,
      };
      this.errors = {
        commands: null,
        currentCommand: null,
        updating: null,
      };
      this.cache.commandsLastFetch = null;
      this.resetFilters();
      console.log("🔄 Store commandes réinitialisé");
    },
  },
});
