<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import type { Dish } from "~/types/Dish";
import { useCartStore } from "~/stores/panier/cardStore";

const cartStore = useCartStore();
const { announceSuccess } = useScreenReaderAnnouncements();

const props = defineProps<{
  dish: Dish;
}>();

const emit = defineEmits<{
  dishSelected: [dish: Dish];
}>();

// Gestion accessibilité focus
const { setupAccessibleComponent } = useAccessibility();
const cardRef = ref<HTMLElement | null>(null);

onMounted(() => {
  setupAccessibleComponent(cardRef);
});
</script>

<template>
  <article
    ref="cardRef"
    class="dish-card card-accessible"
    :aria-label="`${props.dish.name}, ${props.dish.price}€, ${props.dish.category}`"
    tabindex="0"
    role="button"
    @click="emit('dishSelected', props.dish)"
    @keydown.enter="emit('dishSelected', props.dish)"
    @keydown.space.prevent="emit('dishSelected', props.dish)"
  >
    <div class="dish-image">
      <img
        :src="props.dish.image"
        :alt="`Photo de ${props.dish.name}`"
        loading="lazy"
        width="300"
        height="200"
      />
      <div class="price-badge" aria-hidden="true">{{ props.dish.price }}€</div>
    </div>
    <div class="dish-content">
      <h3 class="dish-name">{{ props.dish.name }}</h3>
      <p class="dish-description">{{ props.dish.description }}</p>

      <!-- Prix lisible par les lecteurs d'écran -->
      <div class="sr-only">Prix: {{ props.dish.price }} euros</div>

      <div class="dish-footer">
        <span
          class="dish-category"
          :aria-label="`Catégorie: ${props.dish.category}`"
        >
          {{ props.dish.category }}
        </span>

        <div
          v-if="props.dish.allergens && props.dish.allergens.length > 0"
          class="allergens"
          role="alert"
          :aria-label="`Attention allergènes: ${props.dish.allergens.join(
            ', '
          )}`"
        >
          <span class="allergens-label" aria-hidden="true"
            >⚠️ Allergènes :</span
          >
          <span class="allergen-list">{{
            props.dish.allergens.join(", ")
          }}</span>
        </div>
      </div>
    </div>

    <!-- Indicateur visuel pour navigation clavier -->
    <div class="keyboard-hint sr-only" aria-live="polite">
      Appuyez sur Entrée ou Espace pour voir les détails de ce plat
    </div>
  </article>
</template>

<style scoped>
.dish-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  box-shadow: none;
}

.dish-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.dish-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.dish-card:hover .dish-image img {
  transform: scale(1.05);
}

.price-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.dish-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.dish-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
}

.dish-description {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  flex-grow: 1;
}

.dish-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f1f3f4;
}

.dish-category {
  display: inline-block;
  background: #f8f9fa;
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.allergens {
  margin-top: 0.5rem;
}

.allergens-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e74c3c;
}

.allergen-list {
  font-size: 0.8rem;
  color: #e74c3c;
  font-style: italic;
  margin-left: 0.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dish-image {
    height: 150px;
  }

  .dish-content {
    padding: 1rem;
  }

  .dish-name {
    font-size: 1.2rem;
  }

  .dish-description {
    font-size: 0.9rem;
  }

  .price-badge {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .dish-image {
    height: 120px;
  }

  .dish-name {
    font-size: 1.1rem;
  }

  .price-badge {
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
