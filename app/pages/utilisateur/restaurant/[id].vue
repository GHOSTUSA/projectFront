<script lang="ts" setup>
import DishCard from "~/components/DishCard.vue";
import type { Restaurant } from "~/types/Restaurant";
import { useCartStore } from "~/stores/panier/cardStore";

const cartStore = useCartStore();
const route = useRoute();
const restaurantId = route.params.id;

/**
 * Récupère un restaurant par son ID avec SSR/ISR optimisé
 * @param id - ID du restaurant
 * @returns Restaurant trouvé ou erreur 404
 */
async function fetchRestaurantById(id: string): Promise<Restaurant> {
  try {
    const data: any = await $fetch(`/api/data.json`);
    const restaurant: Restaurant | undefined = data.restaurants.find(
      (r: Restaurant) => String(r.id) === id
    );

    if (!restaurant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Restaurant not found",
      });
    }

    console.log(`Restaurant ${restaurant.name} chargé côté serveur (SSR/ISR)`);
    return restaurant;
  } catch (error) {
    console.error("Erreur lors du chargement du restaurant:", error);
    throw error;
  }
}

// Validation de l'ID du restaurant
if (!restaurantId || Array.isArray(restaurantId)) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid restaurant ID",
  });
}

// Chargement du restaurant côté serveur (SSR/ISR)
const restaurant: Restaurant = await fetchRestaurantById(restaurantId);

// Configuration SEO dynamique basée sur le restaurant
useSeoMeta({
  title: `${restaurant.name} - ${restaurant.cuisineType} | FoodDelivery`,
  ogTitle: `Commandez chez ${restaurant.name}`,
  description: `Découvrez ${restaurant.name}, restaurant ${restaurant.cuisineType} noté ${restaurant.averageRating}/5. ${restaurant.dishes.length} plats disponibles. Livraison rapide.`,
  ogDescription: `${restaurant.cuisineType} • Note ${restaurant.averageRating}/5 • ${restaurant.dishes.length} plats délicieux • Commandez maintenant !`,
  keywords: `${restaurant.name}, ${restaurant.cuisineType}, restaurant, livraison, ${restaurant.address}`,
  ogImage: restaurant.image,
  twitterCard: "summary_large_image",
});

// Configuration des balises structurées pour le SEO
useHead({
  link: [
    {
      rel: "canonical",
      href: `https://fooddelivery.com/utilisateur/restaurant/${restaurant.id}`,
    },
  ],
  meta: [
    {
      name: "robots",
      content: "index, follow",
    },
    {
      property: "og:type",
      content: "restaurant",
    },
    {
      property: "place:location:latitude",
      content: "48.8566", // Coordonnées exemple - à remplacer par vraies données
    },
    {
      property: "place:location:longitude",
      content: "2.3522",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: restaurant.name,
        image: restaurant.image,
        address: {
          "@type": "PostalAddress",
          streetAddress: restaurant.address,
        },
        telephone: restaurant.phone,
        servesCuisine: restaurant.cuisineType,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: restaurant.averageRating,
          bestRating: "5",
        },
        hasMenu: {
          "@type": "Menu",
          hasMenuSection: {
            "@type": "MenuSection",
            hasMenuItem: restaurant.dishes.map((dish) => ({
              "@type": "MenuItem",
              name: dish.name,
              description: dish.description,
              offers: {
                "@type": "Offer",
                price: dish.price,
                priceCurrency: "EUR",
              },
            })),
          },
        },
      }),
    },
  ],
});

// Configuration ISR (Incremental Static Regeneration)
definePageMeta({
  // Mise en cache pour 1 heure, puis régénération en arrière-plan
  prerender: true,
  experimentalNoScripts: false,
});

/**
 * Ajoute un plat au panier avec feedback utilisateur
 * @param dish - Plat à ajouter
 */
function addToCart(dish: any) {
  cartStore.addToCart(dish);
  console.log("Plat ajouté au panier:", dish.name);

  // Feedback visuel possible (toast, notification)
  // useNuxtApp().$toast?.success(`${dish.name} ajouté au panier !`)
}
</script>

<template>
  <div class="restaurant-detail">
    <div class="restaurant-header">
      <img
        :src="restaurant.image"
        :alt="restaurant.name"
        class="restaurant-image"
      />
      <div class="restaurant-info">
        <h1>{{ restaurant.name }}</h1>
        <p class="cuisine-type">{{ restaurant.cuisineType }}</p>

        <div class="rating-section">
          <span class="rating-label">Note</span>
          <div class="rating-content">
            <span class="rating-value">{{ restaurant.averageRating }}</span>
            <div class="stars">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ filled: n <= Math.floor(restaurant.averageRating) }"
              >
                ★
              </span>
            </div>
          </div>
        </div>

        <div class="contact-info">
          <h3>Informations de contact</h3>
          <p>{{ restaurant.address }}</p>
          <p>{{ restaurant.phone }}</p>
        </div>
      </div>
    </div>

    <div class="dishes-section">
      <h2>Plats disponibles</h2>
      <div class="dishes-grid">
        <div v-for="dish in restaurant.dishes" :key="dish.id" class="dish-item">
          <DishCard :dish="dish" />
          <div class="dish-actions">
            <button @click="addToCart(dish)" class="add-to-cart-btn">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.restaurant-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.restaurant-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 3rem;
}

.restaurant-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.restaurant-info {
  padding: 2rem;
}

.restaurant-info h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.cuisine-type {
  font-size: 1.2rem;
  color: #7f8c8d;
  font-style: italic;
  margin: 0 0 2rem 0;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
}

.rating-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.rating-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.star.filled {
  color: #ffd700;
}

.contact-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.contact-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.contact-info p {
  margin: 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.dishes-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.dishes-section h2 {
  text-align: center;
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 2rem 0;
  font-weight: 600;
  border-bottom: 2px solid #27ae60;
  padding-bottom: 1rem;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.dish-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.dish-item:hover {
  transform: translateY(-5px);
}

.dish-actions {
  padding: 1.5rem;
  text-align: center;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  margin-top: auto;
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .restaurant-detail {
    padding: 1rem 0.5rem;
  }

  .restaurant-image {
    height: 200px;
  }

  .restaurant-info {
    padding: 1.5rem;
  }

  .restaurant-info h1 {
    font-size: 2rem;
  }

  .dishes-section {
    padding: 1.5rem;
  }

  .dishes-section h2 {
    font-size: 1.7rem;
  }

  .dishes-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .rating-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .restaurant-info h1 {
    font-size: 1.8rem;
  }

  .dishes-section h2 {
    font-size: 1.5rem;
  }

  .rating-section,
  .contact-info {
    padding: 1rem;
  }
}
</style>
