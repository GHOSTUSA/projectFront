import { defineStore } from "pinia";
import type { Restaurant } from "~/types/Restaurant";
import type { Dish } from "~/types/Dish";

/**
 * Store pour la gestion globale des restaurants
 * Optimisations: cache intelligent, getters réactifs, actions optimisées
 */
export const useRestaurantStore = defineStore("restaurant", {
  state: () => ({
    /** Cache des restaurants chargés */
    restaurants: [] as Restaurant[],

    /** Restaurant actuellement sélectionné */
    currentRestaurant: null as Restaurant | null,

    /** Plat actuellement sélectionné */
    currentDish: null as Dish | null,

    /** États de chargement */
    loading: {
      restaurants: false,
      currentRestaurant: false,
      currentDish: false,
    },

    /** Gestion des erreurs */
    errors: {
      restaurants: null as string | null,
      currentRestaurant: null as string | null,
      currentDish: null as string | null,
    },

    /** Métadonnées de cache */
    cache: {
      restaurantsLastFetch: null as Date | null,
      restaurantsTtl: 5 * 60 * 1000, // 5 minutes TTL
    },

    /** Filtres et recherche */
    filters: {
      searchQuery: "",
      cuisineType: "",
      minRating: 0,
      sortBy: "name" as "name" | "rating" | "cuisine",
      sortOrder: "asc" as "asc" | "desc",
    },
  }),

  getters: {
    /**
     * Restaurants filtrés et triés selon les critères actuels
     */
    filteredRestaurants: (state): Restaurant[] => {
      let filtered = [...state.restaurants];

      // Filtre par recherche textuelle
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(query) ||
            restaurant.cuisineType.toLowerCase().includes(query) ||
            restaurant.address.toLowerCase().includes(query)
        );
      }

      // Filtre par type de cuisine
      if (state.filters.cuisineType) {
        filtered = filtered.filter(
          (restaurant) =>
            restaurant.cuisineType.toLowerCase() ===
            state.filters.cuisineType.toLowerCase()
        );
      }

      // Filtre par note minimale
      if (state.filters.minRating > 0) {
        filtered = filtered.filter(
          (restaurant) => restaurant.averageRating >= state.filters.minRating
        );
      }

      // Tri
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (state.filters.sortBy) {
          case "rating":
            aValue = a.averageRating;
            bValue = b.averageRating;
            break;
          case "cuisine":
            aValue = a.cuisineType;
            bValue = b.cuisineType;
            break;
          default:
            aValue = a.name;
            bValue = b.name;
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
     * Types de cuisine disponibles (pour les filtres)
     */
    availableCuisineTypes: (state): string[] => {
      const types = new Set(state.restaurants.map((r) => r.cuisineType));
      return Array.from(types).sort();
    },

    /**
     * Statistiques des restaurants
     */
    restaurantStats: (state) => ({
      total: state.restaurants.length,
      averageRating:
        state.restaurants.length > 0
          ? state.restaurants.reduce((sum, r) => sum + r.averageRating, 0) /
            state.restaurants.length
          : 0,
      totalDishes: state.restaurants.reduce(
        (sum, r) => sum + (r.dishes?.length || 0),
        0
      ),
      topRated: state.restaurants
        .filter((r) => r.averageRating >= 4.5)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5),
    }),

    /**
     * Restaurant par ID (optimisé avec cache)
     */
    getRestaurantById: (state) => {
      return (id: string | number): Restaurant | undefined => {
        return state.restaurants.find((r) => String(r.id) === String(id));
      };
    },

    /**
     * Plat par ID dans un restaurant spécifique
     */
    getDishById: (state) => {
      return (
        restaurantId: string | number,
        dishId: string | number
      ): Dish | undefined => {
        const restaurant = state.restaurants.find(
          (r) => String(r.id) === String(restaurantId)
        );
        if (!restaurant) return undefined;

        return restaurant.dishes?.find((d) => String(d.id) === String(dishId));
      };
    },

    /**
     * Vérifie si le cache des restaurants est valide
     */
    isCacheValid: (state): boolean => {
      if (!state.cache.restaurantsLastFetch) return false;

      const now = new Date();
      const elapsed =
        now.getTime() - state.cache.restaurantsLastFetch.getTime();
      return elapsed < state.cache.restaurantsTtl;
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
  },

  actions: {
    /**
     * Charge tous les restaurants avec cache intelligent
     */
    async fetchRestaurants(forceRefresh = false): Promise<Restaurant[]> {
      // Vérification du cache si pas de rafraîchissement forcé
      if (!forceRefresh && this.isCacheValid && this.restaurants.length > 0) {
        console.log("🎯 Restaurants chargés depuis le cache");
        return this.restaurants;
      }

      this.loading.restaurants = true;
      this.errors.restaurants = null;

      try {
        const data = await $fetch<{ restaurants: Restaurant[] }>(
          "/api/data.json"
        );

        this.restaurants = data.restaurants || [];
        this.cache.restaurantsLastFetch = new Date();

        console.log(
          `✅ ${this.restaurants.length} restaurants chargés et mis en cache`
        );
        return this.restaurants;
      } catch (error) {
        const errorMessage = "Erreur lors du chargement des restaurants";
        this.errors.restaurants = errorMessage;
        console.error("❌", errorMessage, error);
        throw error;
      } finally {
        this.loading.restaurants = false;
      }
    },

    /**
     * Charge un restaurant spécifique par ID
     */
    async fetchRestaurantById(id: string | number): Promise<Restaurant> {
      // Vérification dans le cache local d'abord
      const cachedRestaurant = this.getRestaurantById(id);
      if (cachedRestaurant) {
        this.currentRestaurant = cachedRestaurant;
        console.log(
          `🎯 Restaurant ${cachedRestaurant.name} chargé depuis le cache`
        );
        return cachedRestaurant;
      }

      this.loading.currentRestaurant = true;
      this.errors.currentRestaurant = null;

      try {
        // Si pas en cache, charger tous les restaurants
        await this.fetchRestaurants();

        const restaurant = this.getRestaurantById(id);
        if (!restaurant) {
          throw new Error(`Restaurant avec l'ID ${id} introuvable`);
        }

        this.currentRestaurant = restaurant;
        console.log(`✅ Restaurant ${restaurant.name} chargé`);
        return restaurant;
      } catch (error) {
        const errorMessage = `Erreur lors du chargement du restaurant ${id}`;
        this.errors.currentRestaurant = errorMessage;
        console.error("❌", errorMessage, error);
        throw error;
      } finally {
        this.loading.currentRestaurant = false;
      }
    },

    /**
     * Charge un plat spécifique
     */
    async fetchDish(
      restaurantId: string | number,
      dishId: string | number
    ): Promise<{ dish: Dish; restaurant: Restaurant }> {
      this.loading.currentDish = true;
      this.errors.currentDish = null;

      try {
        // Assurer que le restaurant est chargé
        const restaurant = await this.fetchRestaurantById(restaurantId);

        const dish = this.getDishById(restaurantId, dishId);
        if (!dish) {
          throw new Error(
            `Plat avec l'ID ${dishId} introuvable dans le restaurant ${restaurantId}`
          );
        }

        this.currentDish = dish;
        console.log(`✅ Plat ${dish.name} chargé`);
        return { dish, restaurant };
      } catch (error) {
        const errorMessage = `Erreur lors du chargement du plat ${dishId}`;
        this.errors.currentDish = errorMessage;
        console.error("❌", errorMessage, error);
        throw error;
      } finally {
        this.loading.currentDish = false;
      }
    },

    /**
     * Met à jour les filtres de recherche
     */
    updateFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
      console.log("🔍 Filtres mis à jour:", this.filters);
    },

    /**
     * Réinitialise les filtres
     */
    resetFilters() {
      this.filters = {
        searchQuery: "",
        cuisineType: "",
        minRating: 0,
        sortBy: "name",
        sortOrder: "asc",
      };
      console.log("🔄 Filtres réinitialisés");
    },

    /**
     * Vide le cache et force un rechargement
     */
    invalidateCache() {
      this.cache.restaurantsLastFetch = null;
      this.restaurants = [];
      this.currentRestaurant = null;
      this.currentDish = null;
      console.log("🧹 Cache invalidé");
    },

    /**
     * Nettoie les erreurs
     */
    clearErrors() {
      this.errors = {
        restaurants: null,
        currentRestaurant: null,
        currentDish: null,
      };
    },

    /**
     * Réinitialise complètement le store
     */
    $reset() {
      this.restaurants = [];
      this.currentRestaurant = null;
      this.currentDish = null;
      this.loading = {
        restaurants: false,
        currentRestaurant: false,
        currentDish: false,
      };
      this.errors = {
        restaurants: null,
        currentRestaurant: null,
        currentDish: null,
      };
      this.cache.restaurantsLastFetch = null;
      this.resetFilters();
      console.log("🔄 Store restaurant réinitialisé");
    },
  },
});
