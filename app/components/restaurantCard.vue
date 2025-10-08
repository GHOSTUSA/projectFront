<script setup lang="ts">
import type { Restaurant } from "~/types/Restaurant";

const props = defineProps<{
  restaurant: Restaurant;
}>();
</script>

<template>
  <div id="main" :style="`background-image: url(${props.restaurant.image});`">
    <div id="cover"></div>
    <div id="info">
      <p id="title">{{ props.restaurant.name }}</p>
      <p id="cuisine">
        <i>{{ props.restaurant.cuisineType }}</i>
      </p>
      <p id="rating">{{ props.restaurant.averageRating }}</p>
    </div>
  </div>
</template>

<style scoped>
#main {
  position: relative;
  height: 15vh;
  width: 80vw;
  border: 1px solid black;
  margin: 3vw;
  background-size: cover;
  background-position: center;
  border-radius: 15px;
}
#cover {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}
#info {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 2;
  color: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
#title {
  margin-top: 3vh;
  font-size: 1.7rem;
  font-weight: bold;
}
#cuisine {
  font-size: 1.2rem;
}
#rating {
  position: absolute;
  font-size: 1.2rem;
  margin: 1ch;
  right: 0;
  bottom: 0;
}
</style>
