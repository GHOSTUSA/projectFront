<script lang="ts" setup>
import type { Restaurant } from "~/types/Restaurant";

// Configuration SEO pour la page liste des restaurants
useSeoMeta({
  title: "Restaurants disponibles - FoodDelivery",
  ogTitle: "Découvrez nos restaurants partenaires",
  description:
    "Découvrez notre sélection de restaurants partenaires et commandez vos plats préférés en ligne. Livraison rapide et sécurisée.",
  ogDescription:
    "Large choix de restaurants : cuisine française, italienne, asiatique et plus encore. Commandez maintenant !",
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
});

/**
 * Récupère la liste des restaurants côté serveur (SSR)
 * Optimisé pour le SEO et les performances
 */
async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const data: any = await $fetch("/api/data.json");
    const fetchedRestaurants: Restaurant[] = data.restaurants;

    console.log(
      "Restaurants récupérés côté serveur:",
      fetchedRestaurants.length
    );
    return fetchedRestaurants;
  } catch (error) {
    console.error("Erreur lors du chargement des restaurants:", error);
    return [];
  }
}

// Données récupérées côté serveur pour le SSR
const restaurants = await fetchRestaurants();

// Mise à jour du titre si aucun restaurant
if (!restaurants || restaurants.length === 0) {
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

    <div
      v-if="restaurants && restaurants.length > 0"
      class="restaurants-container"
    >
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

    <div v-else class="no-restaurants">
      <h3>Aucun restaurant disponible</h3>
      <p>Veuillez réessayer plus tard.</p>
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
