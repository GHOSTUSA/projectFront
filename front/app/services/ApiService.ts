/* Service centralisé pour la gestion des API avec typage strict */
import type { DataApiResponse, LoginRequest } from "@/types/Api";
import type { Restaurant } from "@/types/Restaurant";
import type { PublicUser } from "@/types/User";
import type { Command } from "@/types/Command";
import type { Dish } from "@/types/Dish";

export class ApiService {
  // Appel REST pour récupérer tous les restaurants
  static async getRestaurants(): Promise<Restaurant[]> {
    return await $fetch<Restaurant[]>("http://localhost:8080/api/restaurants");
  }

  // Appel REST pour récupérer un restaurant par ID
  static async getRestaurantById(id: number): Promise<Restaurant | null> {
    try {
      return await $fetch<Restaurant>(
        `http://localhost:8080/api/restaurants/${id}`,
      );
    } catch (e) {
      return null;
    }
  }

  // Appel REST pour récupérer les plats d'un restaurant
  static async getDishesByRestaurant(restaurantId: number): Promise<Dish[]> {
    return await $fetch<Dish[]>(
      `http://localhost:8080/api/restaurants/${restaurantId}/dishes`,
    );
  }

  // Appel REST pour login
  static async login(credentials: LoginRequest): Promise<PublicUser | null> {
    try {
      const user = await $fetch<PublicUser>(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          body: credentials,
        },
      );
      return user;
    } catch (e) {
      return null;
    }
  }

  // Appel REST pour récupérer les commandes d'un utilisateur
  static async getUserCommands(userId: number): Promise<Command[]> {
    return await $fetch<Command[]>(
      `http://localhost:8080/api/users/${userId}/commands`,
    );
  }

  // Appel REST pour récupérer toutes les commandes
  static async getAllCommands(): Promise<Command[]> {
    return await $fetch<Command[]>("http://localhost:8080/api/commands");
  }

  // Appel REST pour rechercher des restaurants
  static async searchRestaurants(
    query?: string,
    cuisineType?: string,
  ): Promise<Restaurant[]> {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (cuisineType) params.append("cuisineType", cuisineType);
    return await $fetch<Restaurant[]>(
      `http://localhost:8080/api/restaurants/search?${params.toString()}`,
    );
  }
  // Appel REST pour récupérer tous les utilisateurs
  static async getAllUsers(): Promise<PublicUser[]> {
    return await $fetch<PublicUser[]>("http://localhost:8080/api/users");
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
