<script lang="ts" setup>
import { useCartStore } from "~/stores/panier/cardStore";
const cartStore = useCartStore();
</script>

<template>
  <div>
    <h1>Voici votre panier</h1>
    <div v-if="cartStore.cartItems.length === 0">
      <p>Votre panier est vide.</p>
    </div>
    <div id="cart-items" v-else>
      <div v-for="dish in cartStore.cartItems" :key="dish.id">
        <DishCard :dish="dish" />
        <div id="buttons">
          <button @click="cartStore.removeFromCart(dish)">
            Retirer du panier
          </button>
        </div>
      </div>
    </div>
    <div v-if="cartStore.cartItems.length > 0" id="buttons">
      <button
        style="background-color: royalblue"
        @click="cartStore.clearCart()"
      >
        Vider le panier
      </button>
      <button style="background-color: green">
        Passer la commande({{ cartStore.cartPrice }}€)
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
button {
  background-color: #a73f28;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2rem;
}
</style>
