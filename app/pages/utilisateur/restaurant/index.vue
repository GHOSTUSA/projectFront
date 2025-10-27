<script lang="ts" setup>
import type { Restaurant } from "~/types/Restaurant";
import { useRestaurantStore } from "~/stores/restaurant/restaurantStore";

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

// Configuration SEO pour la page liste des restaurants
useSeoMeta({
  title: "Restaurants disponibles - FoodDelivery",
  ogTitle: "Découvrez nos restaurants partenaires",
  description: `Découvrez ${restaurants.value.length} restaurants de qualité. Cuisine française, italienne, asiatique et plus encore. Livraison rapide et service client exceptionnel.`,
  ogDescription:
    "Large choix de restaurants • Livraison rapide • Paiement sécurisé • Commandez maintenant !",
  keywords: "restaurant, livraison, commande en ligne, food delivery, cuisine",
  ogImage: "/images/restaurants-hero.jpg",
  twitterCard: "summary_large_image",
});

// Configuration de la balise canonique
useHead({
  link: [
    {
      rel: "canonical",
      href: "https://fooddelivery.com/utilisateur/restaurant",
    },
  ],
  meta: [
    {
      name: "robots",
      content: "index, follow",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:locale",
      content: "fr_FR",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Restaurants disponibles",
        description: "Découvrez notre sélection de restaurants partenaires",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: restaurants.value.length,
          itemListElement: restaurants.value.map(
            (restaurant: Restaurant, index: number) => ({
              "@type": "Restaurant",
              position: index + 1,
              name: restaurant.name,
              servesCuisine: restaurant.cuisineType,
              address: restaurant.address,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: restaurant.averageRating,
                bestRating: "5",
              },
            })
          ),
        },
      }),
    },
  ],
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
if (!restaurants.value || restaurants.value.length === 0) {
  useSeoMeta({
    title: "Aucun restaurant disponible - FoodDelivery",
    description:
      "Nos restaurants sont temporairement indisponibles. Revenez bientôt pour découvrir notre sélection.",
  });
}
</script>

<template>
  <div class="restaurants-page">
    <div class="page-header">
      <h1>Restaurants disponibles</h1>
      <p>Où voulez-vous commander aujourd'hui ?</p>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement des restaurants...</p>
    </div>

    <!-- Gestion des erreurs réseau -->
    <div v-else-if="fetchError" class="error-state">
      <div class="error-content">
        <h3>❌ Erreur de chargement</h3>
        <p>
          {{ fetchError.message || "Impossible de charger les restaurants" }}
        </p>
        <div class="error-actions">
          <button
            @click="retryFetch"
            class="retry-btn"
            :disabled="retryCount >= maxRetries"
          >
            <span v-if="retryCount > 0"
              >Tentative {{ retryCount }}/{{ maxRetries }}</span
            >
            <span v-else>Réessayer</span>
          </button>
          <button @click="handleRefresh" class="refresh-btn">
            ↻ Actualiser
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des restaurants -->
    <div
      v-else-if="restaurants && restaurants.length > 0"
      class="restaurants-container"
    >
      <div class="restaurants-actions">
        <button @click="handleRefresh" class="refresh-data-btn">
          ↻ Actualiser la liste
        </button>
      </div>

      <div class="restaurants-grid">
        <router-link
          v-for="restaurant in restaurants"
          :key="restaurant.id"
          :to="`/utilisateur/restaurant/${restaurant.id}`"
          class="restaurant-link"
        >
          <RestaurantCard :restaurant="restaurant" />
        </router-link>
      </div>
    </div>

    <!-- Aucun restaurant -->
    <div v-else class="no-restaurants">
      <h3>Aucun restaurant disponible</h3>
      <p>Veuillez réessayer plus tard.</p>
      <button @click="handleRefresh" class="retry-btn">Actualiser</button>
    </div>
  </div>
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
