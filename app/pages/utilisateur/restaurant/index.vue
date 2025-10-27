<script lang="ts" setup>
import type { Restaurant } from "~/types/Restaurant";
import { useRestaurantStore } from "~/stores/restaurant/restaurantStore";

// Internationalisation
const { t } = useI18n();

// Store pour la gestion optimisée des restaurants
const restaurantStore = useRestaurantStore();

/**
 * Data fetching optimisé avec useFetch + intégration store
 */
const {
  data: restaurantsData,
  pending: loading,
  error: fetchError,
  refresh: refreshRestaurants,
} = await useFetch("/api/data.json", {
  key: "restaurants-list",
  server: true,
  lazy: false,
  default: () => ({ restaurants: [] }),
  transform: (data: any) => {
    const restaurants = data.restaurants || [];
    console.log(
      `${restaurants.length} restaurants chargés avec useFetch + store`
    );

    // Mise en cache dans le store
    restaurantStore.restaurants = restaurants;
    restaurantStore.cache.restaurantsLastFetch = new Date();

    return restaurants;
  },
  getCachedData(key) {
    const nuxtApp = useNuxtApp();
    // Vérification du cache store d'abord
    if (
      restaurantStore.isCacheValid &&
      restaurantStore.restaurants.length > 0
    ) {
      console.log("🎯 Utilisation du cache store");
      return restaurantStore.restaurants;
    }
    // Sinon cache Nuxt standard
    return (
      (nuxtApp.ssrContext?.cache as any)?.[key] ??
      (nuxtApp.payload.data as any)[key]
    );
  },
  onResponseError({ error }) {
    console.error("Erreur de réponse restaurants:", error);
    restaurantStore.errors.restaurants =
      "Erreur lors du chargement des restaurants";
  },
  onRequestError({ error }) {
    console.error("Erreur de requête restaurants:", error);
    restaurantStore.errors.restaurants = "Service temporairement indisponible";
  },
});

// Utilisation des données via le store avec filtres/tri
const restaurants = computed(() =>
  restaurantStore.restaurants.length > 0
    ? restaurantStore.filteredRestaurants
    : restaurantsData.value || []
);

const restaurantStats = computed(() => restaurantStore.restaurantStats);

// Composable personnalisé pour retry
const retryCount = ref(0);
const maxRetries = 3;

async function retryFetch() {
  if (retryCount.value < maxRetries) {
    retryCount.value++;
    console.log(`Tentative de rechargement ${retryCount.value}/${maxRetries}`);
    await refreshRestaurants();
  }
}

// Configuration SEO dynamique basée sur les données réelles
watchEffect(() => {
  if (restaurants.value.length > 0) {
    useRestaurantListSEO(restaurants.value);
  }
});

// Configuration ISR
definePageMeta({
  prerender: true,
  experimentalNoScripts: false,
});

// Wrapper pour le refresh
async function handleRefresh() {
  await refreshRestaurants();
}

// Mise à jour du titre si aucun restaurant
watchEffect(() => {
  if (!restaurants.value || restaurants.value.length === 0) {
    useSeoMeta({
      title: t("pages.restaurant.list.seo.noRestaurantsTitle"),
      description: t("pages.restaurant.list.seo.noRestaurantsDescription"),
    });
  }
});
</script>

<template>
  <!-- Skip links pour navigation clavier -->
  <div class="skip-links">
    <a href="#main-content" class="skip-link">{{
      t("accessibility.skipToMainContent")
    }}</a>
    <a href="#restaurant-list" class="skip-link">{{
      t("accessibility.skipToRestaurantList")
    }}</a>
  </div>

  <main class="restaurants-page container-accessible" id="main-content">
    <!-- En-tête de page accessible -->
    <header class="page-header">
      <h1 id="page-title">{{ t("pages.restaurant.list.title") }}</h1>
      <p class="page-description">
        {{
          t("pages.restaurant.list.description", { count: restaurants.length })
        }}
      </p>
    </header>

    <!-- État de chargement accessible -->
    <div v-if="loading" class="loading-state" role="status" aria-live="polite">
      <div class="loading-spinner-accessible" aria-hidden="true"></div>
      <p>{{ t("common.loading.restaurants") }}</p>
      <span class="sr-only">{{ t("accessibility.pleaseWait") }}</span>
    </div>

    <!-- Gestion des erreurs réseau accessible -->
    <div
      v-else-if="fetchError"
      class="error-state status-error"
      role="alert"
      aria-live="assertive"
    >
      <div class="error-content">
        <h2>{{ t("errors.loading.title") }}</h2>
        <p>
          {{ fetchError.message || t("errors.loading.restaurantsGeneral") }}
        </p>
        <div class="error-actions">
          <button
            @click="retryFetch"
            class="btn-accessible retry-btn"
            :disabled="retryCount >= maxRetries"
            :aria-label="
              retryCount > 0
                ? t('common.buttons.retryAttempt', {
                    current: retryCount,
                    max: maxRetries,
                  })
                : t('common.buttons.retryLoading')
            "
          >
            <span v-if="retryCount > 0">{{
              t("common.buttons.attempt", {
                current: retryCount,
                max: maxRetries,
              })
            }}</span>
            <span v-else>{{ t("common.buttons.retry") }}</span>
          </button>
          <button
            @click="handleRefresh"
            class="btn-accessible btn-secondary refresh-btn"
            :aria-label="t('common.buttons.refreshList')"
          >
            <span aria-hidden="true">↻</span> {{ t("common.buttons.refresh") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des restaurants accessible -->
    <div
      v-else-if="restaurants && restaurants.length > 0"
      class="restaurants-container"
    >
      <!-- Actions de la liste -->
      <div class="restaurants-actions">
        <button
          @click="handleRefresh"
          class="btn-accessible btn-secondary refresh-data-btn"
          :aria-label="t('common.buttons.refreshList')"
        >
          <span aria-hidden="true">↻</span>
          {{ t("common.buttons.refreshList") }}
        </button>
      </div>

      <!-- Annonce pour les lecteurs d'écran -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{
          t("pages.restaurant.list.screenReader.available", {
            count: restaurants.length,
          })
        }}
      </div>

      <!-- Grille de restaurants accessible -->
      <section
        class="restaurants-grid"
        id="restaurant-list"
        role="region"
        :aria-label="
          t('pages.restaurant.list.screenReader.listOf', {
            count: restaurants.length,
          })
        "
      >
        <router-link
          v-for="(restaurant, index) in restaurants"
          :key="restaurant.id"
          :to="`/utilisateur/restaurant/${restaurant.id}`"
          class="restaurant-link link-accessible"
          :aria-label="
            t('pages.restaurant.list.screenReader.viewRestaurant', {
              name: restaurant.name,
              cuisine: restaurant.cuisineType,
              rating: restaurant.averageRating,
            })
          "
          :aria-posinset="index + 1"
          :aria-setsize="restaurants.length"
        >
          <RestaurantCard :restaurant="restaurant" />
        </router-link>
      </section>

      <!-- Statistiques pour les lecteurs d'écran -->
      <div class="sr-only">
        {{
          t("pages.restaurant.list.screenReader.listEnd", {
            count: restaurants.length,
          })
        }}
      </div>
    </div>

    <!-- Aucun restaurant accessible -->
    <div
      v-else
      class="no-restaurants status-info"
      role="status"
      aria-live="polite"
    >
      <h2>{{ t("pages.restaurant.list.noRestaurants.title") }}</h2>
      <p>{{ t("pages.restaurant.list.noRestaurants.description") }}</p>
      <button
        @click="handleRefresh"
        class="btn-accessible retry-btn"
        :aria-label="t('pages.restaurant.list.noRestaurants.refreshAriaLabel')"
      >
        {{ t("common.buttons.refresh") }}
      </button>
    </div>
  </main>
</template>

<style scoped>
.restaurants-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.page-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
}

.restaurants-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.restaurants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  justify-items: center;
}

.restaurant-link {
  text-decoration: none;
  width: 100%;
  transition: transform 0.3s ease;
}

.restaurant-link:hover {
  transform: translateY(-5px);
}

.no-restaurants {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.no-restaurants h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.no-restaurants p {
  color: #7f8c8d;
  font-size: 1rem;
}

/* États de chargement et d'erreur */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.error-content h3 {
  color: #dc2626;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.error-content p {
  color: #7f1d1d;
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn,
.refresh-btn,
.refresh-data-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.retry-btn:hover,
.refresh-btn:hover,
.refresh-data-btn:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
}

.retry-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.refresh-btn {
  background: linear-gradient(135deg, #3498db, #74b9ff);
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #2980b9, #3498db);
}

.restaurants-actions {
  text-align: center;
  margin-bottom: 2rem;
}

.refresh-data-btn {
  background: linear-gradient(135deg, #6c757d, #95a5a6);
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
}

.refresh-data-btn:hover {
  background: linear-gradient(135deg, #5a6268, #6c757d);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .restaurants-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .restaurants-page {
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .restaurants-container {
    padding: 0 0.5rem;
  }
}
</style>
