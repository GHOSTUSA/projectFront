<!-- Composant d'affichage d'un restaurant -->
<script setup lang="ts">
import type { Restaurant } from "~/types/Restaurant";

const props = defineProps<{
  restaurant: Restaurant;
}>();

const { restaurant } = toRefs(props);

const handleImageError = () => {
  console.warn(`Erreur de chargement de l'image pour ${restaurant.value.name}`);
};
</script>

<template>
  <div class="restaurant-card">
    <div class="restaurant-image">
      <NuxtImg
        :src="restaurant.image"
        :alt="`Photo du restaurant ${restaurant.name}`"
        width="400"
        height="250"
        sizes="sm:400px md:320px lg:400px"
        format="webp"
        quality="85"
        loading="lazy"
        placeholder
        class="restaurant-img"
        @error="handleImageError"
      />
      <div class="image-overlay"></div>
    </div>
    <div class="restaurant-info">
      <h3 class="restaurant-name">{{ props.restaurant.name }}</h3>
      <p class="restaurant-cuisine">{{ props.restaurant.cuisineType }}</p>
      <div class="restaurant-rating">
        <div class="stars">
          <span
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ filled: n <= Math.floor(props.restaurant.averageRating) }"
          >
            ★
          </span>
        </div>
        <span class="rating-value">{{ props.restaurant.averageRating }}</span>
      </div>
      <div class="restaurant-details">
        <p class="restaurant-address">{{ props.restaurant.address }}</p>
        <p class="restaurant-phone">{{ props.restaurant.phone }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.restaurant-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 400px;
}

.restaurant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.restaurant-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.restaurant-image .restaurant-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.restaurant-card:hover .restaurant-image .restaurant-img {
  transform: scale(1.05);
}

.restaurant-card:hover .restaurant-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
}

.restaurant-info {
  padding: 1.5rem;
}

.restaurant-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.restaurant-cuisine {
  color: #7f8c8d;
  font-style: italic;
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.restaurant-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.star.filled {
  color: #ffd700;
}

.rating-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.restaurant-details {
  border-top: 1px solid #f1f3f4;
  padding-top: 1rem;
}

.restaurant-address,
.restaurant-phone {
  color: #7f8c8d;
  font-size: 0.85rem;
  margin: 0.25rem 0;
  line-height: 1.4;
}

.restaurant-address {
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .restaurant-card {
    max-width: 100%;
  }

  .restaurant-image {
    height: 150px;
  }

  .restaurant-info {
    padding: 1rem;
  }

  .restaurant-name {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .restaurant-image {
    height: 120px;
  }

  .restaurant-name {
    font-size: 1.2rem;
  }

  .restaurant-rating {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
