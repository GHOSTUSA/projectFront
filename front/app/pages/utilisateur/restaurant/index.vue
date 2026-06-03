<!-- Page Vue - Liste des restaurants utilisateur -->
<script lang="ts" setup>
import type { Restaurant } from "~/types/Restaurant";
import { useRestaurantStore } from "~/stores/restaurant/restaurantStore";

const { t } = useI18n();

const RestaurantCard = defineAsyncComponent({
  loader: () => import("~/components/restaurantCard.vue"),
  loadingComponent: defineComponent({
    template: `
      <div class="restaurant-card-skeleton" role="status" :aria-label="t('accessibility.loading')">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
          <div class="skeleton-rating"></div>
        </div>
      </div>
    `,
  }),
  errorComponent: defineComponent({
    template: `
      <div class="restaurant-card-error" role="alert">
        <p>{{ t('errors.loading.general') }}</p>
      </div>
    `,
  }),
  delay: 100,
  timeout: 3000,
});

const restaurantStore = useRestaurantStore();
const searchQuery = ref("");
const selectedCuisine = ref("");
const selectedSort = ref<"name" | "rating" | "cuisine">("name");

const loading = ref(true);
const fetchError = ref<any>(null);

await restaurantStore.fetchRestaurants().catch((e) => {
  fetchError.value = e;
}).finally(() => {
  loading.value = false;
});

const restaurants = computed(() => restaurantStore.filteredRestaurants);

const restaurantStats = computed(() => restaurantStore.restaurantStats);

const retryCount = ref(0);
const maxRetries = 3;

const cuisineTypes = computed(() => restaurantStore.availableCuisineTypes);

async function retryFetch() {
  if (retryCount.value < maxRetries) {
    retryCount.value++;
    console.log(`Tentative de rechargement ${retryCount.value}/${maxRetries}`);
    await handleRefresh();
  }
}

watch([searchQuery, selectedCuisine, selectedSort], ([query, cuisine, sort]) => {
  restaurantStore.updateFilters({
    searchQuery: query,
    cuisineType: cuisine,
    sortBy: sort,
    sortOrder: sort === "rating" ? "desc" : "asc",
  });
});

watchEffect(() => {
  if (restaurants.value.length > 0) {
    useRestaurantListSEO(restaurants.value);
  }
});

definePageMeta({
  prerender: true,
  experimentalNoScripts: false,
});

async function handleRefresh() {
  loading.value = true;
  await restaurantStore.fetchRestaurants(true).catch((e) => {
    fetchError.value = e;
  }).finally(() => {
    loading.value = false;
  });
}

watchEffect(() => {
  if (!restaurants.value || restaurants.value.length === 0) {
    useSeoMeta({
      title: t("pages.restaurant.list.seo.noRestaurantsTitle"),
      description: t("pages.restaurant.list.seo.noRestaurantsDescription"),
    });
  }
});
</script>

<template>
  <div class="skip-links">
    <a href="#main-content" class="skip-link">{{
      t("accessibility.skipToMainContent")
    }}</a>
    <a href="#restaurant-list" class="skip-link">{{
      t("accessibility.skipToRestaurantList")
    }}</a>
  </div>

  <main class="restaurants-page container-accessible" id="main-content">
    <header class="page-header">
      <h1 id="page-title">{{ t("pages.restaurant.list.title") }}</h1>
      <p class="page-description">
        {{
          t("pages.restaurant.list.description", { count: restaurants.length })
        }}
      </p>

      <div class="stats-row" v-if="restaurants.length > 0">
        <div class="stat-pill">
          <strong>{{ restaurants.length }}</strong>
          <span>{{ t("pages.restaurant.list.stats.restaurants") }}</span>
        </div>
        <div class="stat-pill">
          <strong>{{ restaurantStats.totalDishes }}</strong>
          <span>{{ t("pages.restaurant.list.stats.dishes") }}</span>
        </div>
        <div class="stat-pill">
          <strong>{{ restaurantStats.averageRating.toFixed(1) }}</strong>
          <span>{{ t("pages.restaurant.list.stats.averageRating") }}</span>
        </div>
      </div>

      <div class="filters-bar" v-if="!loading && !fetchError">
        <input v-model="searchQuery" type="search" class="filter-input"
          :placeholder="t('pages.restaurant.list.filters.searchPlaceholder')" />

        <select v-model="selectedCuisine" class="filter-select">
          <option value="">{{ t("pages.restaurant.list.filters.allCuisines") }}</option>
          <option v-for="cuisine in cuisineTypes" :key="cuisine" :value="cuisine">
            {{ cuisine }}
          </option>
        </select>

        <select v-model="selectedSort" class="filter-select">
          <option value="name">{{ t("pages.restaurant.list.filters.sortByName") }}</option>
          <option value="rating">{{ t("pages.restaurant.list.filters.sortByRating") }}</option>
          <option value="cuisine">{{ t("pages.restaurant.list.filters.sortByCuisine") }}</option>
        </select>
      </div>
    </header>

    <div v-if="loading" class="loading-state" role="status" aria-live="polite">
      <div class="loading-spinner-accessible" aria-hidden="true"></div>
      <p>{{ t("common.loading.restaurants") }}</p>
      <span class="sr-only">{{ t("accessibility.pleaseWait") }}</span>
    </div>

    <div v-else-if="fetchError" class="error-state status-error" role="alert" aria-live="assertive">
      <div class="error-content">
        <h2>{{ t("errors.loading.title") }}</h2>
        <p>
          {{ fetchError.message || t("errors.loading.restaurantsGeneral") }}
        </p>
        <div class="error-actions">
          <button @click="retryFetch" class="btn-accessible retry-btn" :disabled="retryCount >= maxRetries" :aria-label="retryCount > 0
            ? t('common.buttons.retryAttempt', {
              current: retryCount,
              max: maxRetries,
            })
            : t('common.buttons.retryLoading')
            ">
            <span v-if="retryCount > 0">{{
              t("common.buttons.attempt", {
                current: retryCount,
                max: maxRetries,
              })
            }}</span>
            <span v-else>{{ t("common.buttons.retry") }}</span>
          </button>
          <button @click="handleRefresh" class="btn-accessible btn-secondary refresh-btn"
            :aria-label="t('common.buttons.refreshList')">
            <span aria-hidden="true">↻</span> {{ t("common.buttons.refresh") }}
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="restaurants && restaurants.length > 0" class="restaurants-container">
      <div class="restaurants-actions">
        <button @click="handleRefresh" class="btn-accessible btn-secondary refresh-data-btn"
          :aria-label="t('common.buttons.refreshList')">
          <span aria-hidden="true">↻</span>
          {{ t("common.buttons.refreshList") }}
        </button>
      </div>

      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{
          t("pages.restaurant.list.screenReader.available", {
            count: restaurants.length,
          })
        }}
      </div>

      <Suspense>
        <template #default>
          <section class="restaurants-grid" id="restaurant-list" role="region" :aria-label="t('pages.restaurant.list.screenReader.listOf', {
            count: restaurants.length,
          })
            ">
            <NuxtLink v-for="(restaurant, index) in restaurants" :key="restaurant.id"
              :to="`/utilisateur/restaurant/${restaurant.id}`" class="restaurant-link link-accessible" :aria-label="t('pages.restaurant.list.screenReader.viewRestaurant', {
                name: restaurant.name,
                cuisine: restaurant.cuisineType,
                rating: restaurant.averageRating,
              })
                " :aria-posinset="index + 1" :aria-setsize="restaurants.length">
              <RestaurantCard :restaurant="restaurant" />
            </NuxtLink>
          </section>
        </template>

        <template #fallback>
          <div class="restaurants-grid" role="status" aria-live="polite">
            <div v-for="i in Math.min(6, restaurants.length || 6)" :key="`skeleton-${i}`"
              class="restaurant-card-skeleton" :aria-label="t('pages.restaurant.list.loadingCardAriaLabel', { index: i })">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-subtitle"></div>
                <div class="skeleton-rating"></div>
              </div>
            </div>
          </div>
        </template>
      </Suspense>

      <div class="sr-only">
        {{
          t("pages.restaurant.list.screenReader.listEnd", {
            count: restaurants.length,
          })
        }}
      </div>
    </div>

    <div v-else class="no-restaurants status-info" role="status" aria-live="polite">
      <h2>{{ t("pages.restaurant.list.noRestaurants.title") }}</h2>
      <p>
        {{
          searchQuery || selectedCuisine
            ? t("pages.restaurant.list.noRestaurants.filteredDescription")
            : t("pages.restaurant.list.noRestaurants.description")
        }}
      </p>
      <button @click="handleRefresh" class="btn-accessible retry-btn"
        :aria-label="t('pages.restaurant.list.noRestaurants.refreshAriaLabel')">
        {{ t("common.buttons.refresh") }}
      </button>
    </div>
  </main>
</template>

<style scoped>
.restaurants-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.page-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
}

.stats-row {
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #eef7f0;
  color: #1f5132;
  border: 1px solid #cfe9d5;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-size: 0.9rem;
}

.filters-bar {
  margin-top: 1.2rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 0.75rem;
}

.filter-input,
.filter-select {
  border: 1px solid #dbe3ea;
  background: #fff;
  border-radius: 10px;
  padding: 0.75rem 0.85rem;
  font-size: 0.92rem;
  color: #2c3e50;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.14);
}

.restaurants-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.restaurants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  justify-items: center;
}

.restaurant-link {
  text-decoration: none;
  width: 100%;
  transition: transform 0.3s ease;
}

.restaurant-link:hover {
  transform: translateY(-5px);
}

.no-restaurants {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.no-restaurants h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.no-restaurants p {
  color: #7f8c8d;
  font-size: 1rem;
}

/* États de chargement et d'erreur */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.error-content h3 {
  color: #dc2626;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.error-content p {
  color: #7f1d1d;
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn,
.refresh-btn,
.refresh-data-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.retry-btn:hover,
.refresh-btn:hover,
.refresh-data-btn:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
}

.retry-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.refresh-btn {
  background: linear-gradient(135deg, #3498db, #74b9ff);
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #2980b9, #3498db);
}

.restaurants-actions {
  text-align: center;
  margin-bottom: 2rem;
}

.refresh-data-btn {
  background: linear-gradient(135deg, #6c757d, #95a5a6);
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
}

.refresh-data-btn:hover {
  background: linear-gradient(135deg, #5a6268, #6c757d);
}

/* Skeleton Loading Components */
.restaurant-card-skeleton {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
}

.skeleton-image {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s infinite;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-title {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-subtitle {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  width: 70%;
}

.skeleton-rating {
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s infinite;
  border-radius: 4px;
  width: 50%;
}

@keyframes skeleton-wave {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

@keyframes skeleton-pulse {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.7;
  }
}

.restaurant-card-error {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .restaurants-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .restaurants-page {
    padding: 1rem 0;
  }

  .filters-bar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .restaurants-container {
    padding: 0 0.5rem;
  }
}
</style>
