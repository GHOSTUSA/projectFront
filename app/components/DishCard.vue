<script lang="ts" setup>
import { defineProps } from "vue";
import type { Dish } from "~/types/Dish";
import { useCartStore } from "~/stores/panier/cardStore";
const cartStore = useCartStore();

const props = defineProps<{
  dish: Dish;
}>();
</script>

<template>
  <div class="dish-card">
    <img :src="props.dish.image" :alt="props.dish.name" />
    <h3>{{ props.dish.name }}</h3>
    <p>{{ props.dish.description }}</p>
    <p>Price: {{ props.dish.price }}€</p>
  </div>
</template>

<style scoped>
.dish-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  width: 35vh;
  display: grid;
  grid-template-columns: 2fr 1fr;
}
.dish-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
