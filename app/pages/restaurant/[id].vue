<script lang="ts" setup>
import type { Restaurant } from "~/types/Restaurant";
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
  <div>
    <h1>Restaurant Details Page</h1>
    <p>This is a placeholder for restaurant details.</p>
    <p>{{ restaurant.name }}</p>
  </div>
</template>

<style scoped></style>
