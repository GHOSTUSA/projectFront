<!-- Page Vue - Détail d'un restaurant et menu des plats -->
<script lang="ts" setup>
import DishCard from "~/components/DishCard.vue";
import type { Restaurant } from "~/types/Restaurant";
import { useCartStore } from "~/stores/panier/cardStore";

const cartStore = useCartStore();
const route = useRoute();
const restaurantId = route.params.id;

// Validation simple sans throw immédiat
const isValidId = !(!restaurantId || Array.isArray(restaurantId));

// Récupération des données seulement si l'ID est valide
const {
  data: restaurantData,
  error,
  pending,
} = await useLazyFetch("/api/data.json", {
  key: `restaurant-${restaurantId}`,
  server: false,
  transform: (data: any) => {
    console.log("Transform - ID recherché:", restaurantId);

    if (!data?.restaurants) {
      console.log("Transform - Pas de restaurants dans la réponse");
      return null;
    }

    const restaurant = data.restaurants.find(
      (r: any) => String(r.id) === String(restaurantId)
    );

    console.log(
      "Transform - Restaurant trouvé:",
      restaurant ? restaurant.name : "Non trouvé"
    );
    return restaurant || null;
  },
});

// État calculé pour la gestion d'erreurs
const restaurant = computed(() => restaurantData.value);
const hasError = computed(() => !isValidId || !!error.value);
const errorMessage = computed(() => {
  if (!isValidId) return "ID de restaurant invalide";
  if (error.value) return "Erreur lors du chargement";
  if (!pending.value && !restaurant.value && isValidId)
    return `Restaurant avec l'ID ${restaurantId} introuvable`;
  return null;
});

// SEO conditionnel
watchEffect(() => {
  if (restaurant.value) {
    useRestaurantSEO(restaurant.value);
  }
});

definePageMeta({
  prerender: true,
  experimentalNoScripts: false,
});

function addToCart(dish: any) {
  cartStore.addToCart(dish);
  console.log("Plat ajouté au panier:", dish.name);
}
</script>

<template>
  <!-- État de chargement -->
  <div v-if="pending" class="loading-state">
    <div class="loading-spinner"></div>
    <p>Chargement du restaurant...</p>
  </div>

  <!-- État d'erreur -->
  <div v-else-if="hasError || errorMessage" class="error-state">
    <h1>Erreur</h1>
    <p>{{ errorMessage }}</p>
    <NuxtLink to="/utilisateur/restaurant" class="back-link">
      ← Retour à la liste des restaurants
    </NuxtLink>
  </div>

  <!-- Restaurant trouvé -->
  <div v-else-if="restaurant" class="restaurant-detail">
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
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 2rem;
}

.error-state h1 {
  color: #e74c3c;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-state p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.back-link {
  color: #27ae60;
  text-decoration: none;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: 2px solid #27ae60;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-link:hover {
  background: #27ae60;
  color: white;
}

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
  border-left: 4px solid #60db34ff;
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
