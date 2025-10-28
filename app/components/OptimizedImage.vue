<!-- Composant Vue - Image optimisée avec lazy loading -->
<script lang="ts" setup>
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  class?: string;
  style?: string;
}

const props = withDefaults(defineProps<OptimizedImageProps>(), {
  loading: "lazy",
  width: 300,
  height: 200,
});

// État de chargement pour les placeholders
const isLoaded = ref(false);
const hasError = ref(false);

const handleLoad = () => {
  isLoaded.value = true;
};

const handleError = () => {
  hasError.value = true;
  isLoaded.value = true;
};

const placeholderStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  backgroundColor: "#f0f0f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#999",
  fontSize: "14px",
}));
</script>

<template>
  <div class="optimized-image-container" :class="class" :style="style">
    <div
      v-if="!isLoaded"
      class="image-placeholder"
      :style="placeholderStyle"
      role="img"
      :aria-label="`Chargement de l'image: ${alt}`"
    >
      <div class="loading-spinner"></div>
    </div>

    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      class="optimized-img"
      :class="{
        'image-loaded': isLoaded,
        'image-hidden': !isLoaded || hasError,
      }"
      @load="handleLoad"
      @error="handleError"
    />

    <div
      v-if="hasError"
      class="image-error"
      :style="placeholderStyle"
      role="img"
      :aria-label="`Erreur de chargement de l'image: ${alt}`"
    >
      <span>⚠️ Image indisponible</span>
    </div>
  </div>
</template>

<style scoped>
.optimized-image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.optimized-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.optimized-img.image-hidden {
  opacity: 0;
  position: absolute;
  z-index: -1;
}

.optimized-img.image-loaded {
  opacity: 1;
  position: relative;
  z-index: 1;
}

.image-placeholder,
.image-error {
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  animation: placeholder-shimmer 1.5s ease-in-out infinite;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.image-error {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  font-size: 12px;
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes placeholder-shimmer {
  0% {
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }
  100% {
    background-position: 20px 0, 20px 10px, 30px -10px, 10px 0px;
  }
}
</style>
