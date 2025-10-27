<script lang="ts" setup>
import { useCartStore } from "~/stores/panier/cardStore";
import { useCommandStore } from "~/stores/commande/commandStore";
import { useAuthStore } from "~/stores/authentification/AuthStore";

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

// Déterminer le restaurant ID basé sur les articles du panier
const getRestaurantId = async () => {
  if (cartStore.cartItems.length === 0) return 1;

  try {
    // Récupérer les données des restaurants pour identifier le restaurant de chaque plat
    const data = await $fetch<any>("/api/data.json");

    // Chercher le restaurant du premier plat du panier
    for (const restaurant of data.restaurants) {
      if (restaurant.dishes && cartStore.cartItems[0]) {
        const dish = restaurant.dishes.find(
          (d: any) => d.id === cartStore.cartItems[0].id
        );
        if (dish) {
          return restaurant.id;
        }
      }
    }

    // Par défaut, retourner le restaurant 1
    return 1;
  } catch (error) {
    console.error("Erreur lors de la récupération du restaurant:", error);
    return 1;
  }
};

// Fonction pour valider la commande
async function validateOrder() {
  if (cartStore.cartItems.length === 0) {
    orderError.value = "Votre panier est vide";
    return;
  }

  isOrderProcessing.value = true;
  orderError.value = "";

  try {
    const restaurantId = await getRestaurantId();

    // Créer la commande
    const newCommand = await commandStore.createCommand(
      cartStore.cartItems,
      restaurantId
    );

    // Vider le panier après succès
    cartStore.clearCart();

    // Marquer le succès
    orderSuccess.value = true;

    // Rediriger vers la page de compte après 2 secondes
    setTimeout(() => {
      navigateTo("/compte");
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
  <div>
    <h1>Voici votre panier</h1>

    <div v-if="orderSuccess" class="success-message">
      <h2>Commande validée avec succès !</h2>
      <p>Vous allez être redirigé vers votre compte...</p>
    </div>

    <div v-if="orderError" class="error-message">
      <p>❌ {{ orderError }}</p>
      <button @click="orderError = ''" class="close-error">Fermer</button>
    </div>

    <div v-if="cartStore.cartItems.length === 0 && !orderSuccess">
      <p>Votre panier est vide.</p>
    </div>

    <div id="cart-items" v-else-if="!orderSuccess">
      <div v-for="dish in cartStore.cartItems" :key="dish.id">
        <DishCard :dish="dish" />
        <div id="buttons">
          <button @click="cartStore.removeFromCart(dish)">
            Retirer du panier
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="cartStore.cartItems.length > 0 && !orderSuccess"
      id="action-buttons"
    >
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
        <span v-if="isOrderProcessing">⏳ Traitement...</span>
        <span v-else>Passer la commande ({{ cartStore.cartPrice }}€)</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 1rem;
}

p {
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  text-align: center;
  margin-top: 2rem;
  color: gray;
  font-style: italic;
}

.success-message {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem auto;
  max-width: 500px;
}

.success-message h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem auto;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background-color: #721c24;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

#cart-items {
  list-style-type: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  justify-items: center;
}

#buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

#action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 2rem;
}

button {
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-button {
  background-color: #6c757d;
}

.clear-button:hover:not(:disabled) {
  background-color: #5a6268;
}

.order-button {
  background-color: #28a745;
  font-weight: bold;
  padding: 0.75rem 2rem;
}

.order-button:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

/* Style pour les boutons des articles individuels */
#buttons button {
  background-color: #dc3545;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

#buttons button:hover {
  background-color: #c82333;
}
</style>
