<script lang="ts" setup>
import type { Dish } from "~/types/Dish";
import type { Restaurant } from "~/types/Restaurant";
import { useCartStore } from "~/stores/panier/cardStore";

const cartStore = useCartStore();
const route = useRoute();
const dishId = route.params.dishId;
const restaurantId = route.params.restaurantId;

// Validation des paramètres de route
if (
  !dishId ||
  Array.isArray(dishId) ||
  !restaurantId ||
  Array.isArray(restaurantId)
) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid dish or restaurant ID",
  });
}

/**
 * Récupère un plat spécifique avec son restaurant via useFetch optimisé
 */
const {
  data: dishData,
  error,
  pending,
  refresh,
} = await useFetch(`/api/data.json`, {
  key: `dish-${restaurantId}-${dishId}`,
  server: true, // SSR pour le SEO
  lazy: false, // Bloque le rendu
  transform: (data: any) => {
    // Trouver le restaurant
    const restaurant: Restaurant | undefined = data.restaurants?.find(
      (r: Restaurant) => String(r.id) === restaurantId
    );

    if (!restaurant) {
      throw createError({
        statusCode: 404,
        statusMessage: `Restaurant avec l'ID ${restaurantId} introuvable`,
      });
    }

    // Trouver le plat dans ce restaurant
    const dish: Dish | undefined = restaurant.dishes?.find(
      (d: Dish) => String(d.id) === dishId
    );

    if (!dish) {
      throw createError({
        statusCode: 404,
        statusMessage: `Plat avec l'ID ${dishId} introuvable dans ce restaurant`,
      });
    }

    console.log(
      `Plat ${dish.name} du restaurant ${restaurant.name} chargé côté serveur (SSR)`
    );
    return { dish, restaurant };
  },
  onResponseError({ error }) {
    console.error("Erreur de réponse:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors du chargement du plat",
    });
  },
  onRequestError({ error }) {
    console.error("Erreur de requête:", error);
    throw createError({
      statusCode: 503,
      statusMessage: "Service temporairement indisponible",
    });
  },
});

// Gestion d'erreur si pas de données
if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 500,
    statusMessage:
      error.value.statusMessage || "Erreur lors du chargement du plat",
  });
}

const { dish, restaurant } = dishData.value!;

// Configuration SEO avancée pour le plat
useSeoMeta({
  title: `${dish.name} - ${restaurant.name} | FoodDelivery`,
  ogTitle: `${dish.name} chez ${restaurant.name}`,
  description: `${dish.description} • ${dish.price}€ • ${restaurant.cuisineType} • Livraison rapide depuis ${restaurant.name}`,
  ogDescription: `Commandez ${dish.name} pour ${dish.price}€. ${dish.description}`,
  keywords: `${dish.name}, ${dish.category}, ${restaurant.name}, ${
    restaurant.cuisineType
  }, livraison, ${dish.allergens.join(", ")}`,
  ogImage: dish.image,
  twitterCard: "summary_large_image",
});

// Balises SEO produit optimisées
useHead({
  link: [
    {
      rel: "canonical",
      href: `https://fooddelivery.com/utilisateur/restaurant/${restaurant.id}/plat/${dish.id}`,
    },
  ],
  meta: [
    {
      name: "robots",
      content: "index, follow",
    },
    // Balises produit
    {
      property: "product:price:amount",
      content: dish.price.toString(),
    },
    {
      property: "product:price:currency",
      content: "EUR",
    },
    {
      property: "product:availability",
      content: "in stock",
    },
    {
      property: "product:condition",
      content: "new",
    },
    {
      property: "product:category",
      content: dish.category,
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: dish.name,
        description: dish.description,
        image: dish.image,
        category: dish.category,
        offers: {
          "@type": "Offer",
          price: dish.price,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `https://fooddelivery.com/utilisateur/restaurant/${restaurant.id}/plat/${dish.id}`,
          seller: {
            "@type": "Restaurant",
            name: restaurant.name,
            address: restaurant.address,
            telephone: restaurant.phone,
          },
        },
        nutrition: {
          "@type": "NutritionInformation",
          allergenInfo: dish.allergens.join(", "),
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: restaurant.averageRating,
          bestRating: "5",
        },
      }),
    },
  ],
});

// Configuration pour le rendu SSR
definePageMeta({
  prerender: true,
});

/**
 * Ajoute le plat au panier
 */
function addToCart() {
  cartStore.addToCart(dish);
  console.log(`${dish.name} ajouté au panier`);
}

/**
 * Navigue vers le restaurant parent
 */
function goToRestaurant() {
  navigateTo(`/utilisateur/restaurant/${restaurant.id}`);
}
</script>

<template>
  <div class="dish-detail">
    <!-- Breadcrumb pour la navigation -->
    <nav class="breadcrumb" aria-label="Fil d'Ariane">
      <ol>
        <li><NuxtLink to="/utilisateur/restaurant">Restaurants</NuxtLink></li>
        <li>
          <button @click="goToRestaurant">{{ restaurant.name }}</button>
        </li>
        <li aria-current="page">{{ dish.name }}</li>
      </ol>
    </nav>

    <!-- Header du plat -->
    <header class="dish-header">
      <div class="dish-image-container">
        <img
          :src="dish.image"
          :alt="`${dish.name} - ${restaurant.name}`"
          class="dish-image"
          loading="eager"
        />
        <div class="category-badge">{{ dish.category }}</div>
      </div>

      <div class="dish-info">
        <h1>{{ dish.name }}</h1>
        <p class="restaurant-context">Chez {{ restaurant.name }}</p>

        <div class="price-section">
          <span class="price">{{ dish.price }}€</span>
          <span class="currency">TTC</span>
        </div>

        <div class="restaurant-rating">
          <span class="rating-label">Restaurant noté</span>
          <div class="rating">
            <span class="rating-value">{{ restaurant.averageRating }}</span>
            <div class="stars">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ filled: n <= Math.floor(restaurant.averageRating) }"
                :aria-label="`${n} étoile${n > 1 ? 's' : ''}`"
              >
                ★
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Description et détails -->
    <section class="dish-details">
      <div class="description-section">
        <h2>Description</h2>
        <p class="description">{{ dish.description }}</p>
      </div>

      <!-- Informations allergènes -->
      <div
        v-if="dish.allergens && dish.allergens.length > 0"
        class="allergens-section"
      >
        <h3>Allergènes</h3>
        <div class="allergens-list">
          <span
            v-for="allergen in dish.allergens"
            :key="allergen"
            class="allergen-tag"
          >
            {{ allergen }}
          </span>
        </div>
      </div>

      <!-- Informations restaurant -->
      <div class="restaurant-info">
        <h3>Proposé par {{ restaurant.name }}</h3>
        <p class="cuisine-type">{{ restaurant.cuisineType }}</p>
        <p class="restaurant-address">{{ restaurant.address }}</p>
        <p class="restaurant-phone">{{ restaurant.phone }}</p>
      </div>
    </section>

    <!-- Actions -->
    <section class="dish-actions">
      <button
        @click="addToCart"
        class="add-to-cart-btn"
        :aria-label="`Ajouter ${dish.name} au panier pour ${dish.price}€`"
      >
        <span class="btn-icon">🛒</span>
        Ajouter au panier - {{ dish.price }}€
      </button>

      <button
        @click="goToRestaurant"
        class="view-restaurant-btn"
        :aria-label="`Voir tous les plats de ${restaurant.name}`"
      >
        Voir le restaurant
      </button>
    </section>
  </div>
</template>

<style scoped>
.dish-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 2rem;
}

.breadcrumb ol {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
  align-items: center;
}

.breadcrumb li {
  color: #7f8c8d;
}

.breadcrumb li:not(:last-child)::after {
  content: ">";
  margin-left: 0.5rem;
  color: #bdc3c7;
}

.breadcrumb a,
.breadcrumb button {
  color: #3498db;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: inherit;
}

.breadcrumb a:hover,
.breadcrumb button:hover {
  text-decoration: underline;
}

.breadcrumb [aria-current="page"] {
  color: #2c3e50;
  font-weight: 600;
}

/* Header du plat */
.dish-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 3rem;
}

.dish-image-container {
  position: relative;
}

.dish-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.category-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(39, 174, 96, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.dish-info {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
}

.dish-info h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
}

.restaurant-context {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
  font-style: italic;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
}

.currency {
  font-size: 1rem;
  color: #7f8c8d;
}

.restaurant-rating {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 1.1rem;
}

.star.filled {
  color: #ffd700;
}

/* Détails du plat */
.dish-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.description-section,
.allergens-section,
.restaurant-info {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.description-section {
  grid-column: 1 / -1;
}

.description-section h2 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.description {
  color: #34495e;
  line-height: 1.6;
  font-size: 1.1rem;
  margin: 0;
}

.allergens-section h3,
.restaurant-info h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.allergens-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.allergen-tag {
  background: #e74c3c;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.restaurant-info p {
  margin: 0.5rem 0;
  color: #7f8c8d;
}

.cuisine-type {
  font-weight: 600;
  color: #27ae60 !important;
}

/* Actions */
.dish-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 1.2rem 2.5rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

.view-restaurant-btn {
  background: transparent;
  color: #3498db;
  border: 2px solid #3498db;
  padding: 1.2rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-restaurant-btn:hover {
  background: #3498db;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1em;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dish-detail {
    padding: 1rem 0.5rem;
  }

  .dish-header {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .dish-image {
    height: 250px;
  }

  .dish-info h1 {
    font-size: 2rem;
  }

  .dish-details {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .dish-actions {
    flex-direction: column;
  }

  .add-to-cart-btn,
  .view-restaurant-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .dish-info {
    padding: 1.5rem;
  }

  .dish-info h1 {
    font-size: 1.8rem;
  }

  .price {
    font-size: 1.8rem;
  }

  .description-section,
  .allergens-section,
  .restaurant-info {
    padding: 1.5rem;
  }
}
</style>
