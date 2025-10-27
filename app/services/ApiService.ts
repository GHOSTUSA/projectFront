/**
 * Service de gestion des API avec typage strict
 * Centralise toutes les requêtes vers les APIs et assure un typage robuste
 */

import type {
  ApiResponse,
  DataApiResponse,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  CreateCommandRequest,
} from "@/types/Api";
import type { Restaurant } from "@/types/Restaurant";
import type { User, PublicUser } from "@/types/User";
import type { Command } from "@/types/Command";
import type { Dish } from "@/types/Dish";

/**
 * Configuration de base pour les requêtes API
 */
const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
} as const;

/**
 * Type générique pour les fonctions de requête
 */
type ApiFunction<TRequest = any, TResponse = any> = (
  data?: TRequest
) => Promise<TResponse>;

/**
 * Service principal pour les requêtes API
 * Utilise le système de fetch de Nuxt avec typage strict
 */
export class ApiService {
  /**
   * Récupère les données statiques depuis data.json
   * @returns Promise contenant restaurants, users et commands
   */
  static async getStaticData(): Promise<DataApiResponse> {
    try {
      const data = await $fetch<DataApiResponse>("/api/data.json");
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      throw new Error("Impossible de charger les données");
    }
  }

  /**
   * Récupère la liste de tous les restaurants
   * @returns Promise<Restaurant[]>
   */
  static async getRestaurants(): Promise<Restaurant[]> {
    const data = await this.getStaticData();
    return data.restaurants;
  }

  /**
   * Récupère un restaurant par son ID
   * @param id - ID du restaurant
   * @returns Promise<Restaurant | null>
   */
  static async getRestaurantById(id: number): Promise<Restaurant | null> {
    const restaurants = await this.getRestaurants();
    return restaurants.find((r) => r.id === id) || null;
  }

  /**
   * Récupère les plats d'un restaurant
   * @param restaurantId - ID du restaurant
   * @returns Promise<Dish[]>
   */
  static async getDishesByRestaurant(restaurantId: number): Promise<Dish[]> {
    const restaurant = await this.getRestaurantById(restaurantId);
    return restaurant?.dishes || [];
  }

  /**
   * Authentifie un utilisateur
   * @param credentials - Email et mot de passe
   * @returns Promise<PublicUser | null>
   */
  static async login(credentials: LoginRequest): Promise<PublicUser | null> {
    try {
      const data = await this.getStaticData();
      const user = data.users.find(
        (u) =>
          u.email === credentials.email && u.password === credentials.password
      );

      if (user) {
        // Retourne l'utilisateur sans le mot de passe
        const { password, ...publicUser } = user;
        return publicUser;
      }

      return null;
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      throw new Error("Erreur de connexion");
    }
  }

  /**
   * Récupère les commandes d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Promise<Command[]>
   */
  static async getUserCommands(userId: number): Promise<Command[]> {
    const data = await this.getStaticData();
    return data.commands.filter((c) => c.userId === userId);
  }

  /**
   * Récupère toutes les commandes (admin uniquement)
   * @returns Promise<Command[]>
   */
  static async getAllCommands(): Promise<Command[]> {
    const data = await this.getStaticData();
    return data.commands;
  }

  /**
   * Recherche des restaurants par critères
   * @param query - Terme de recherche
   * @param cuisineType - Type de cuisine (optionnel)
   * @returns Promise<Restaurant[]>
   */
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

/**
 * Hooks personnalisés pour utiliser les services avec la réactivité Vue
 */

/**
 * Hook pour récupérer les restaurants avec état de chargement
 */
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

/**
 * Hook pour récupérer un restaurant spécifique
 */
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

  // Surveiller les changements d'ID pour recharger automatiquement
  watch(() => unref(id), fetchRestaurant, { immediate: true });

  return {
    restaurant: readonly(restaurant),
    loading: readonly(loading),
    error: readonly(error),
    fetchRestaurant,
  };
}
