/* Store Pinia pour la gestion des restaurants avec cache intelligent et filtres */
import { defineStore } from "pinia";
import type { Restaurant } from "~/types/Restaurant";
import type { Dish } from "~/types/Dish";

export const useRestaurantStore = defineStore("restaurant", {
  state: () => ({
    restaurants: [] as Restaurant[],
    currentRestaurant: null as Restaurant | null,
    currentDish: null as Dish | null,

    loading: {
      restaurants: false,
      currentRestaurant: false,
      currentDish: false,
    },

    errors: {
      restaurants: null as string | null,
      currentRestaurant: null as string | null,
      currentDish: null as string | null,
    },

    cache: {
      restaurantsLastFetch: null as Date | null,
      restaurantsTtl: 5 * 60 * 1000,
    },

    filters: {
      searchQuery: "",
      cuisineType: "",
      minRating: 0,
      sortBy: "name" as "name" | "rating" | "cuisine",
      sortOrder: "asc" as "asc" | "desc",
    },
  }),

  getters: {
    filteredRestaurants: (state): Restaurant[] => {
      let filtered = [...state.restaurants];

      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(query) ||
            restaurant.cuisineType.toLowerCase().includes(query) ||
            restaurant.address.toLowerCase().includes(query)
        );
      }

      if (state.filters.cuisineType) {
        filtered = filtered.filter(
          (restaurant) =>
            restaurant.cuisineType.toLowerCase() ===
            state.filters.cuisineType.toLowerCase()
        );
      }

      if (state.filters.minRating > 0) {
        filtered = filtered.filter(
          (restaurant) => restaurant.averageRating >= state.filters.minRating
        );
      }

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

    availableCuisineTypes: (state): string[] => {
      const types = new Set(state.restaurants.map((r) => r.cuisineType));
      return Array.from(types).sort();
    },

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

    getRestaurantById: (state) => {
      return (id: string | number): Restaurant | undefined => {
        return state.restaurants.find((r) => String(r.id) === String(id));
      };
    },

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

    isCacheValid: (state): boolean => {
      if (!state.cache.restaurantsLastFetch) return false;

      const now = new Date();
      const elapsed =
        now.getTime() - state.cache.restaurantsLastFetch.getTime();
      return elapsed < state.cache.restaurantsTtl;
    },

    isLoading: (state): boolean => {
      return Object.values(state.loading).some(Boolean);
    },

    hasErrors: (state): boolean => {
      return Object.values(state.errors).some(Boolean);
    },
  },

  actions: {
    async fetchRestaurants(forceRefresh = false): Promise<Restaurant[]> {
      if (!forceRefresh && this.isCacheValid && this.restaurants.length > 0) {
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

        return this.restaurants;
      } catch (error) {
        const errorMessage = "Erreur lors du chargement des restaurants";
        this.errors.restaurants = errorMessage;
        throw error;
      } finally {
        this.loading.restaurants = false;
      }
    },

    async fetchRestaurantById(id: string | number): Promise<Restaurant> {
      const cachedRestaurant = this.getRestaurantById(id);
      if (cachedRestaurant) {
        this.currentRestaurant = cachedRestaurant;
        return cachedRestaurant;
      }

      this.loading.currentRestaurant = true;
      this.errors.currentRestaurant = null;

      try {
        await this.fetchRestaurants();

        const restaurant = this.getRestaurantById(id);
        if (!restaurant) {
          throw new Error(`Restaurant avec l'ID ${id} introuvable`);
        }

        this.currentRestaurant = restaurant;
        return restaurant;
      } catch (error) {
        const errorMessage = `Erreur lors du chargement du restaurant ${id}`;
        this.errors.currentRestaurant = errorMessage;
        throw error;
      } finally {
        this.loading.currentRestaurant = false;
      }
    },

    async fetchDish(
      restaurantId: string | number,
      dishId: string | number
    ): Promise<{ dish: Dish; restaurant: Restaurant }> {
      this.loading.currentDish = true;
      this.errors.currentDish = null;

      try {
        const restaurant = await this.fetchRestaurantById(restaurantId);

        const dish = this.getDishById(restaurantId, dishId);
        if (!dish) {
          throw new Error(
            `Plat avec l'ID ${dishId} introuvable dans le restaurant ${restaurantId}`
          );
        }

        this.currentDish = dish;
        return { dish, restaurant };
      } catch (error) {
        const errorMessage = `Erreur lors du chargement du plat ${dishId}`;
        this.errors.currentDish = errorMessage;
        throw error;
      } finally {
        this.loading.currentDish = false;
      }
    },

    updateFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
    },

    resetFilters() {
      this.filters = {
        searchQuery: "",
        cuisineType: "",
        minRating: 0,
        sortBy: "name",
        sortOrder: "asc",
      };
    },

    invalidateCache() {
      this.cache.restaurantsLastFetch = null;
      this.restaurants = [];
      this.currentRestaurant = null;
      this.currentDish = null;
    },

    clearErrors() {
      this.errors = {
        restaurants: null,
        currentRestaurant: null,
        currentDish: null,
      };
    },

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
    },
  },
});
