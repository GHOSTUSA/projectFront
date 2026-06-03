/* Service centralisé pour la gestion des API avec typage strict */
import type { DataApiResponse, LoginRequest } from "@/types/Api";
import type { Restaurant } from "@/types/Restaurant";
import type { PublicUser } from "@/types/User";
import type { Command } from "@/types/Command";
import type { Dish } from "@/types/Dish";

const DISH_META_STORAGE_KEY = "dish-meta-map";

type DishMeta = {
  category?: string;
  allergens?: string[];
};

const readDishMetaMap = (): Record<string, DishMeta> => {
  if (!import.meta.client) return {};

  try {
    return JSON.parse(localStorage.getItem(DISH_META_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const normalizeDish = (dish: any): Dish => {
  const meta = readDishMetaMap()[String(dish.id)] || {};

  return {
    ...dish,
    description: dish.description || "Description non renseignée",
    category: dish.category || meta.category || "Plat",
    allergens: Array.isArray(dish.allergens)
      ? dish.allergens
      : meta.allergens || [],
  } as Dish;
};

type RestaurantApiRecord = {
  id: string | number;
  name: string;
  address: string;
  phone?: string;
  phoneNumber?: string;
  cuisineType?: string;
  averageRating?: number;
  rating?: number;
  image?: string;
  picture?: string | null;
  dishes?: Dish[];
};

const normalizeRestaurant = (restaurant: RestaurantApiRecord): Restaurant => ({
  id: restaurant.id,
  name: restaurant.name,
  address: restaurant.address,
  phone: restaurant.phone ?? restaurant.phoneNumber ?? "",
  cuisineType: restaurant.cuisineType ?? "",
  averageRating: restaurant.averageRating ?? restaurant.rating ?? 0,
  image: restaurant.image ?? restaurant.picture ?? "",
  dishes: restaurant.dishes ?? [],
});

export class ApiService {
  // Appel REST pour récupérer tous les restaurants
  static async getRestaurants(): Promise<Restaurant[]> {
    const response = await $fetch<
      { restaurants: RestaurantApiRecord[] } | RestaurantApiRecord[]
    >("http://localhost:8082/api/restaurants");

    const restaurants = Array.isArray(response)
      ? response
      : response.restaurants || [];

    return restaurants.map(normalizeRestaurant);
  }

  // Appel REST pour récupérer un restaurant par ID
  static async getRestaurantById(
    id: string | number,
  ): Promise<Restaurant | null> {
    try {
      const all = await this.getRestaurants();
      return all.find((r) => String(r.id) === String(id)) || null;
    } catch (e) {
      return null;
    }
  }

  // Appel REST pour récupérer les plats d'un restaurant
  static async getDishesByRestaurant(
    restaurantId: string | number,
  ): Promise<Dish[]> {
    const dishes = await $fetch<any[]>(
      `http://localhost:8082/api/dishes/restaurant/${restaurantId}`,
    );

    return dishes.map(normalizeDish);
  }

  // Appel REST pour login
  static async login(credentials: LoginRequest): Promise<string | null> {
    try {
      const res = await $fetch<{ token: string }>(
        "http://localhost:8082/api/auth/login",
        {
          method: "POST",
          body: credentials,
        },
      );
      return res.token;
    } catch (e) {
      return null;
    }
  }

  // Appel REST pour récupérer les commandes d'un utilisateur
  static async getUserCommands(userId: string | number): Promise<Command[]> {
    // backend exposes /api/orders/me for the authenticated user; this method
    // is a best-effort fallback to fetch user commands via that route when
    // called client-side with proper auth elsewhere. Keep as-is for now.
    return await $fetch<Command[]>(`/api/data.json`).then(
      (d: any) => d.commands || [],
    );
  }

  // Appel REST pour récupérer toutes les commandes (admin)
  static async getAllCommands(token?: string | null): Promise<Command[]> {
    if (!token) return [];
    return await $fetch<Command[]>("http://localhost:8082/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
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
      `http://localhost:8082/api/restaurants/search?${params.toString()}`,
    );
  }
  // Appel REST pour récupérer tous les utilisateurs (admin)
  static async getAllUsers(token?: string | null): Promise<PublicUser[]> {
    if (!token) return [];
    return await $fetch<PublicUser[]>("http://localhost:8082/api/users", {
      headers: { Authorization: `Bearer ${token}` },
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

export function useRestaurant(id: Ref<string | number> | string | number) {
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
