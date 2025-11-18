/* Service centralisé pour la gestion des API avec typage strict */
import type { DataApiResponse, LoginRequest } from "@/types/Api";
import type { Restaurant } from "@/types/Restaurant";
import type { PublicUser } from "@/types/User";
import type { Command } from "@/types/Command";
import type { Dish } from "@/types/Dish";

export class ApiService {
  static async getStaticData(): Promise<DataApiResponse> {
    try {
      const data = await $fetch<DataApiResponse>("/api/data.json");
      return data;
    } catch (error) {
      throw new Error("Impossible de charger les données");
    }
  }

  static async getRestaurants(): Promise<Restaurant[]> {
    const data = await this.getStaticData();
    return data.restaurants;
  }

  static async getRestaurantById(id: number): Promise<Restaurant | null> {
    const restaurants = await this.getRestaurants();
    return restaurants.find((r) => r.id === id) || null;
  }

  static async getDishesByRestaurant(restaurantId: number): Promise<Dish[]> {
    const restaurant = await this.getRestaurantById(restaurantId);
    return restaurant?.dishes || [];
  }

  static async login(credentials: LoginRequest): Promise<PublicUser | null> {
    try {
      const data = await this.getStaticData();
      const user = data.users.find(
        (u) =>
          u.email === credentials.email && u.password === credentials.password
      );

      if (user) {
        const { password, ...publicUser } = user;
        return publicUser;
      }

      return null;
    } catch (error) {
      throw new Error("Erreur de connexion");
    }
  }

  static async getUserCommands(userId: number): Promise<Command[]> {
    const data = await this.getStaticData();
    return data.commands.filter((c) => c.userId === userId);
  }

  static async getAllCommands(): Promise<Command[]> {
    const data = await this.getStaticData();
    return data.commands;
  }

  static async searchRestaurants(
    query?: string,
    cuisineType?: string
  ): Promise<Restaurant[]> {
    const restaurants = await this.getRestaurants();

    return restaurants.filter((restaurant) => {
      const matchesQuery =
        !query ||
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(query.toLowerCase());

      const matchesCuisine =
        !cuisineType ||
        restaurant.cuisineType.toLowerCase() === cuisineType.toLowerCase();

      return matchesQuery && matchesCuisine;
    });
  }
}

export function useRestaurants() {
  const restaurants = ref<Restaurant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchRestaurants = async () => {
    loading.value = true;
    error.value = null;

    try {
      restaurants.value = await ApiService.getRestaurants();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur inconnue";
    } finally {
      loading.value = false;
    }
  };

  return {
    restaurants: readonly(restaurants),
    loading: readonly(loading),
    error: readonly(error),
    fetchRestaurants,
  };
}

export function useRestaurant(id: Ref<number> | number) {
  const restaurant = ref<Restaurant | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchRestaurant = async () => {
    const restaurantId = unref(id);
    loading.value = true;
    error.value = null;

    try {
      restaurant.value = await ApiService.getRestaurantById(restaurantId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur inconnue";
    } finally {
      loading.value = false;
    }
  };

  watch(() => unref(id), fetchRestaurant, { immediate: true });

  return {
    restaurant: readonly(restaurant),
    loading: readonly(loading),
    error: readonly(error),
    fetchRestaurant,
  };
}
