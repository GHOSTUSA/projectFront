<script lang="ts" setup>
import type { Restaurant } from "~/types/Restaurant";

async function fetchRestaurants() {
  const data: any = await $fetch("/api/data.json");

  const fetchedRestaurants: Restaurant[] = data.restaurants;
  console.log("Restaurants récupérés:", fetchedRestaurants);
  return fetchedRestaurants;
}

const restaurants = await fetchRestaurants();
</script>

<template>
  <p>Ou voulez vous commander pour aujourd'hui ?</p>
  <div v-if="restaurants && restaurants.length > 0">
    <div
      id="restaurant-list"
      v-for="restaurant in restaurants"
      :key="restaurant.id"
    >
      <router-link :to="`/restaurant/${restaurant.id}`">
        <RestaurantCard :restaurant="restaurant" />
      </router-link>
    </div>
  </div>
</template>

<style scoped>
p {
  font-size: 1.2rem;
  margin: 1rem 0;
  font-style: italic;
}
#restaurant-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
</style>
