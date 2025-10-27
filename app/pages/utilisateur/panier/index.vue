<script lang="ts" setup>
import { useCartStore } from "~/stores/panier/cardStore";
import { useCommandStore } from "~/stores/commande/commandStore";
import { useAuthStore } from "~/stores/authentification/AuthStore";
import type { Dish } from "~/types/Dish";

// Appliquer le middleware d'authentification
definePageMeta({
  middleware: "auth",
});

const cartStore = useCartStore();
const commandStore = useCommandStore();
const authStore = useAuthStore();

// État pour gérer le processus de commande
const isOrderProcessing = ref(false);
const orderSuccess = ref(false);
const orderError = ref("");

const getRestaurantId = async () => {
  if (cartStore.cartItems.length === 0) return 1;

  try {
    const data = await $fetch<{ restaurants: Restaurant[] }>("/api/data.json");

    for (const restaurant of data.restaurants) {
      if (restaurant.dishes && cartStore.cartItems[0]) {
        const dish = restaurant.dishes.find(
          (d: Dish) => d.id === cartStore.cartItems[0].id
        );
        if (dish) {
          return restaurant.id;
        }
      }
    }

    return 1;
  } catch (error) {
    console.error("Erreur lors de la récupération du restaurant:", error);
    return 1;
  }
};

async function validateOrder() {
  if (cartStore.cartItems.length === 0) {
    orderError.value = "Votre panier est vide";
    return;
  }

  isOrderProcessing.value = true;
  orderError.value = "";

  try {
    const restaurantId = await getRestaurantId();

    const newCommand = await commandStore.createCommand(
      cartStore.cartItems,
      restaurantId
    );

    cartStore.clearCart();

    orderSuccess.value = true;

    setTimeout(() => {
      navigateTo("/utilisateur/compte");
    }, 2000);
  } catch (error) {
    console.error("Erreur lors de la validation de la commande:", error);
    orderError.value =
      "Erreur lors de la validation de la commande. Veuillez réessayer.";
  } finally {
    isOrderProcessing.value = false;
  }
}
</script>

<template>
  <div class="cart-page">
    <div class="page-header">
      <h1>Mon Panier</h1>
    </div>

    <div v-if="orderSuccess" class="success-message">
      <h2>Commande validée avec succès !</h2>
      <p>Vous allez être redirigé vers votre compte...</p>
    </div>

    <div v-if="orderError" class="error-message">
      <p>{{ orderError }}</p>
      <button @click="orderError = ''" class="close-error">Fermer</button>
    </div>

    <div
      v-if="cartStore.cartItems.length === 0 && !orderSuccess"
      class="empty-cart"
    >
      <h3>Votre panier est vide</h3>
      <p>Découvrez nos restaurants pour ajouter des plats à votre panier.</p>
      <NuxtLink to="/utilisateur/restaurant" class="browse-restaurants-btn">
        Parcourir les restaurants
      </NuxtLink>
    </div>

    <div v-else-if="!orderSuccess" class="cart-content">
      <div class="cart-items">
        <div
          v-for="dish in cartStore.cartItems"
          :key="dish.id"
          class="cart-item"
        >
          <DishCard :dish="dish" />
          <div class="item-actions">
            <button @click="cartStore.removeFromCart(dish)" class="remove-btn">
              Retirer du panier
            </button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-content">
          <h3>Résumé de la commande</h3>
          <div class="total-price">
            <span>Total: {{ cartStore.cartPrice }}€</span>
          </div>
          <div class="action-buttons">
            <button
              class="clear-button"
              @click="cartStore.clearCart()"
              :disabled="isOrderProcessing"
            >
              Vider le panier
            </button>
            <button
              class="order-button"
              @click="validateOrder"
              :disabled="isOrderProcessing"
            >
              <span v-if="isOrderProcessing">Traitement...</span>
              <span v-else>Passer la commande</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.success-message {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  border: 1px solid #27ae60;
  color: #155724;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  margin: 2rem auto;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(39, 174, 96, 0.2);
}

.success-message h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.error-message {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  border: 1px solid #e74c3c;
  color: #721c24;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  margin: 1rem auto;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(231, 76, 60, 0.2);
}

.close-error {
  background: #721c24;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.close-error:hover {
  background: #5a1419;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.empty-cart h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.empty-cart p {
  color: #7f8c8d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.browse-restaurants-btn {
  display: inline-block;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.browse-restaurants-btn:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-2px);
}

.item-actions {
  padding: 1rem;
  text-align: center;
  background: #f8f9fa;
}

.remove-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
}

.cart-summary {
  position: sticky;
  top: 2rem;
}

.summary-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.summary-content h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  text-align: center;
  border-bottom: 2px solid #27ae60;
  padding-bottom: 1rem;
}

.total-price {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #27ae60;
}

.total-price span {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.clear-button {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7f8c8d, #6c757d);
  transform: translateY(-2px);
}

.order-button {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
}

.clear-button:disabled,
.order-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cart-page {
    padding: 1rem 0.5rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .cart-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .cart-summary {
    position: static;
  }

  .error-message {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }

  .summary-content {
    padding: 1.5rem;
  }

  .empty-cart {
    padding: 2rem 1rem;
  }

  .empty-cart h3 {
    font-size: 1.5rem;
  }
}
</style>
