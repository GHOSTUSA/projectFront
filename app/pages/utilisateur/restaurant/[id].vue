<script lang="ts" setup>
import DishCard from "~/components/DishCard.vue";
import type { Restaurant } from "~/types/Restaurant";
import { useCartStore } from "~/stores/panier/cardStore";

const cartStore = useCartStore();
const route = useRoute();
const restaurantId = route.params.id;

async function fetchRestaurantById(id: string): Promise<Restaurant> {
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
  return restaurant;
}
if (!restaurantId || Array.isArray(restaurantId)) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid restaurant ID",
  });
}

const restaurant: Restaurant = await fetchRestaurantById(restaurantId);
</script>

<template>
  <img :src="restaurant.image" :alt="restaurant.name" />
  <div>
    <h1>{{ restaurant.name }}</h1>
    <p id="cuisine-type">{{ restaurant.cuisineType }}</p>
    <div id="rating">
      <p id="rating-label">Note</p>
      <div>
        <p>{{ restaurant.averageRating }}</p>
        <div id="star">
          <p
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ filled: n <= Math.floor(restaurant.averageRating) }"
          >
            ★
          </p>
        </div>
      </div>
    </div>
    <div id="contact">
      Contact :
      <div>{{ restaurant.address }}</div>
      <div>{{ restaurant.phone }}</div>
    </div>
    <div id="dishes"></div>
    <h2>Plats disponibles :</h2>
    <ul>
      <div v-for="dish in restaurant.dishes" :key="dish.id">
        <DishCard :dish="dish" />
        <div id="buttons">
          <button @click="cartStore.addToCart(dish)">Ajouter au panier</button>
          <button id="order-button">Commander</button>
        </div>
      </div>
    </ul>
  </div>
</template>

<style scoped>
img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
h1 {
  text-align: center;
  font-size: 2rem;
  margin: 1rem 0;
}
#cuisine-type {
  font-style: italic;
  text-align: center;
  margin-bottom: 1rem;
}
#rating {
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-self: center;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 70vw;
  height: 10vh;
  gap: 0.5rem;
  font-size: 1.2rem;
  border: 6px solid black;
  border-radius: 15px;
}
#rating-label {
  font-weight: bold;
  font-size: 2.5rem;
  border-right: 1px solid black;
}
#rating div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
}
#star {
  display: flex;
  flex-direction: row !important;
  gap: 0.1rem !important;
}
.star {
  color: #ddd;
  font-size: 1.5rem;
  margin: 0;
}
.star.filled {
  color: #ffd700;
}
#contact {
  margin-top: 2rem;
  margin-left: 1rem;
  font-size: 1.1rem;
}
#contact div {
  font-style: italic;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}
h2 {
  border-top: 1px solid rgb(99, 99, 99);
  margin-top: 2rem;
  padding-top: 2rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
ul {
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
  align-items: center;
  gap: 7vh;
  padding: 2%;
  border-bottom: 1px solid black;
  border-radius: 5px;
  margin-bottom: 2rem;
}

button {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
#order-button {
  background-color: #ff0000;
}
</style>
