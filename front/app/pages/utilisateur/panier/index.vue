<!-- Page Vue - Panier utilisateur et finalisation de commande -->
<script lang="ts" setup>
import { useCartStore } from "~/stores/panier/cardStore";
import { useCommandStore } from "~/stores/commande/commandStore";
import { useAuthStore } from "~/stores/authentification/AuthStore";
import type { Dish } from "~/types/Dish";

const { t } = useI18n();

definePageMeta({
  middleware: "auth",
  ssr: false,
  requiresAuth: true,
});

useSeoMeta({
  title: t("pages.cart.seo.title"),
  description: t("pages.cart.seo.description"),
  robots: "noindex, nofollow",
});

const cartStore = useCartStore();
const commandStore = useCommandStore();
const authStore = useAuthStore();

const isOrderProcessing = ref(false);
const orderSuccess = ref(false);
const orderError = ref("");
const deliveryFee = computed(() => (cartStore.cartItems.length > 0 ? 2.9 : 0));
const subtotal = computed(() => cartStore.cartPrice);
const grandTotal = computed(() => Number((subtotal.value + deliveryFee.value).toFixed(2)));

const getRestaurantId = async (): Promise<string | number> => {
  if (cartStore.cartItems.length === 0) return 1;

  try {
    const restaurants = await import("~/services/ApiService").then((m) =>
      m.ApiService.getRestaurants(),
    );
    for (const restaurant of restaurants) {
      if (restaurant.dishes && cartStore.cartItems[0]) {
        const firstItem = cartStore.cartItems[0];
        const dish = restaurant.dishes.find(
          (d: Dish) => String(d.id) === String(firstItem.id),
        );
        if (dish) {
          return restaurant.id;
        }
      }
    }

    return restaurants.length > 0 ? restaurants[0].id : 1;
  } catch (error) {
    console.error("Erreur lors de la récupération du restaurant:", error);
    return 1;
  }
};

async function validateOrder() {
  if (cartStore.cartItems.length === 0) {
    orderError.value = t("pages.cart.validation.emptyCart");
    return;
  }

  isOrderProcessing.value = true;
  orderError.value = "";

  try {
    const restaurantId = await getRestaurantId();

    await commandStore.createCommand(cartStore.cartItems, restaurantId as any);

    cartStore.clearCart();

    orderSuccess.value = true;

    setTimeout(() => {
      navigateTo("/utilisateur/compte");
    }, 2000);
  } catch (error) {
    console.error("Erreur lors de la validation de la commande:", error);
    orderError.value = t("pages.cart.validation.orderError");
  } finally {
    isOrderProcessing.value = false;
  }
}

function increment(dishId: number) {
  cartStore.incrementItem(dishId);
}

function decrement(dishId: number) {
  cartStore.decrementItem(dishId);
}
</script>

<template>
  <div class="cart-page">
    <div class="page-header">
      <h1>{{ t("pages.cart.title") }}</h1>
      <p class="header-meta">
        {{ cartStore.cartItemCount }} article(s) • {{ cartStore.uniqueItemsCount }} plat(s)
      </p>
    </div>

    <div v-if="orderSuccess" class="success-message">
      <h2>{{ t("pages.cart.success") }}</h2>
      <p>{{ t("accessibility.pleaseWait") }}</p>
    </div>

    <div v-if="orderError" class="error-message">
      <p>{{ orderError }}</p>
      <button @click="orderError = ''" class="close-error">
        {{ t("pages.cart.close") }}
      </button>
    </div>

    <div v-if="cartStore.cartItems.length === 0 && !orderSuccess" class="empty-cart">
      <h3>{{ t("pages.cart.empty") }}</h3>
      <p>{{ t("pages.restaurant.noResultsMessage") }}</p>
      <NuxtLink to="/utilisateur/restaurant" class="browse-restaurants-btn">
        {{ t("nav.restaurants") }}
      </NuxtLink>
    </div>

    <div v-else-if="!orderSuccess" class="cart-content">
      <div class="cart-items">
        <div v-for="dish in cartStore.cartItems" :key="dish.id" class="cart-item">
          <img :src="dish.image" :alt="dish.name" class="item-image" />
          <div class="item-main">
            <h3>{{ dish.name }}</h3>
            <p>{{ dish.description }}</p>
            <div class="item-bottom">
              <div class="qty-controls">
                <button class="qty-btn" @click="decrement(dish.id)">-</button>
                <span class="qty-value">{{ dish.quantity }}</span>
                <button class="qty-btn" @click="increment(dish.id)">+</button>
              </div>
              <div class="item-prices">
                <span class="unit-price">{{ dish.price.toFixed(2) }}€ / unité</span>
                <strong class="line-price">{{ dish.totalPrice.toFixed(2) }}€</strong>
              </div>
            </div>
          </div>
          <div class="item-actions">
            <button @click="cartStore.removeFromCart(dish)" class="remove-btn">
              Retirer
            </button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-content">
          <h3>Résumé</h3>
          <div class="summary-line">
            <span>Sous-total</span>
            <strong>{{ subtotal.toFixed(2) }}€</strong>
          </div>
          <div class="summary-line">
            <span>Livraison</span>
            <strong>{{ deliveryFee.toFixed(2) }}€</strong>
          </div>
          <div class="summary-line total-line">
            <span>Total</span>
            <strong>{{ grandTotal.toFixed(2) }}€</strong>
          </div>
          <div class="action-buttons">
            <button class="clear-button" @click="cartStore.clearCart()" :disabled="isOrderProcessing">
              {{ t("pages.cart.clearCart") }}
            </button>
            <button class="order-button" @click="validateOrder" :disabled="isOrderProcessing">
              <span v-if="isOrderProcessing">{{
                t("pages.cart.processing")
              }}</span>
              <span v-else>{{ t("pages.cart.placeOrder") }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 1100px;
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

.header-meta {
  margin: 0.5rem 0 0;
  color: #6b7280;
  font-size: 0.95rem;
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
  grid-template-columns: 1.7fr 1fr;
  gap: 2rem;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  border: 1px solid #eef2f7;
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 1rem;
  padding: 1rem;
}

.cart-item:hover {
  transform: translateY(-1px);
}

.item-image {
  width: 150px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
}

.item-main h3 {
  margin: 0;
  color: #1f2937;
}

.item-main p {
  margin: 0.4rem 0 0.8rem;
  color: #6b7280;
  font-size: 0.92rem;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.qty-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 0.2rem;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #1f7a4f;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.qty-value {
  min-width: 20px;
  text-align: center;
  font-weight: 700;
  color: #1f2937;
}

.item-prices {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.unit-price {
  color: #6b7280;
  font-size: 0.85rem;
}

.line-price {
  color: #111827;
}

.item-actions {
  display: flex;
  align-items: center;
}

.remove-btn {
  background: #fff;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #fef2f2;
}

.cart-summary {
  position: sticky;
  top: 2rem;
}

.summary-content {
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
  padding: 2rem;
  border: 1px solid #eef2f7;
}

.summary-content h3 {
  margin: 0 0 1rem;
  color: #1f2937;
  font-size: 1.3rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0;
  color: #334155;
  border-bottom: 1px dashed #e2e8f0;
}

.total-line {
  margin-top: 0.4rem;
  font-size: 1.1rem;
  border-bottom: none;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
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

  .cart-item {
    grid-template-columns: 1fr;
  }

  .item-image {
    width: 100%;
    height: 170px;
  }

  .item-bottom {
    flex-direction: column;
    align-items: flex-start;
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
