<script setup lang="ts">
import { useAuthStore } from "~/stores/authentification/AuthStore";

definePageMeta({
  layout: "restaurateur",
  middleware: ["auth", "restaurateur"],
});

const authStore = useAuthStore();

const restaurant = ref<any>(null);
const loading = ref(true);
const saving = ref(false);
const successMessage = ref("");

const cuisineTypes = [
  "Français",
  "Italien",
  "Japonais",
  "Chinois",
  "Indien",
  "Mexicain",
  "Américain",
  "Thaï",
  "Grec",
  "Libanais",
  "Autre",
];

onMounted(async () => {
  try {
    const data = await $fetch<any>("/api/data.json");
    const userRestaurantId = authStore.user?.restaurantId;
    restaurant.value = data.restaurants.find(
      (r: any) => r.id === userRestaurantId
    );

    if (!restaurant.value) {
      throw new Error("Restaurant non trouvé");
    }
  } catch (error) {
    console.error("Erreur lors du chargement du restaurant:", error);
  } finally {
    loading.value = false;
  }
});

const saveRestaurant = async () => {
  if (!restaurant.value) return;

  saving.value = true;

  try {
    console.log("Restaurant mis à jour:", restaurant.value);

    successMessage.value = "Restaurant mis à jour avec succès !";

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="restaurant-management">
    <div class="page-header">
      <h1>Mon Restaurant</h1>
      <p>Gérez les informations de votre restaurant</p>
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div v-if="!loading && restaurant" class="restaurant-form">
      <div class="form-section">
        <h3>Informations générales</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Nom du restaurant</label>
            <input
              v-model="restaurant.name"
              type="text"
              id="name"
              placeholder="Nom de votre restaurant"
            />
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input
              v-model="restaurant.phone"
              type="tel"
              id="phone"
              placeholder="Numéro de téléphone"
            />
          </div>

          <div class="form-group full-width">
            <label for="address">Adresse</label>
            <input
              v-model="restaurant.address"
              type="text"
              id="address"
              placeholder="Adresse complète"
            />
          </div>

          <div class="form-group">
            <label for="cuisine">Type de cuisine</label>
            <select v-model="restaurant.cuisineType" id="cuisine">
              <option v-for="type in cuisineTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="rating">Note moyenne</label>
            <input
              v-model.number="restaurant.averageRating"
              type="number"
              id="rating"
              min="0"
              max="5"
              step="0.1"
              readonly
              title="La note est calculée automatiquement"
            />
          </div>

          <div class="form-group full-width">
            <label for="image">URL de l'image</label>
            <input
              v-model="restaurant.image"
              type="url"
              id="image"
              placeholder="https://exemple.com/image.jpg"
            />
          </div>
        </div>
      </div>

      <div v-if="restaurant.image" class="image-preview">
        <h3>Aperçu de l'image</h3>
        <div class="preview-container">
          <img :src="restaurant.image" :alt="restaurant.name" />
        </div>
      </div>

      <div class="restaurant-stats">
        <h3>Statistiques</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Plats au menu</span>
            <span class="stat-value">{{ restaurant.dishes?.length || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Note moyenne</span>
            <span class="stat-value">{{ restaurant.averageRating }}/5 ⭐</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Type de cuisine</span>
            <span class="stat-value">{{ restaurant.cuisineType }}</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button @click="saveRestaurant" :disabled="saving" class="save-btn">
          <span v-if="saving">Sauvegarde...</span>
          <span v-else>Sauvegarder</span>
        </button>
        <NuxtLink to="/Admin/restaurateur" class="cancel-btn">
          Retour au dashboard
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <p>Chargement des informations du restaurant...</p>
    </div>

    <div v-else class="error-state">
      <p>Erreur : Restaurant non trouvé</p>
      <NuxtLink to="/Admin/restaurateur" class="back-btn">
        Retour au dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.restaurant-management {
  padding: 1rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.2rem;
  color: #e67e22;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #7f8c8d;
  font-size: 1rem;
}

.success-message {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 500;
}

.restaurant-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #e67e22;
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
}

.form-group input[readonly] {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.image-preview {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.image-preview h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.preview-container {
  max-width: 400px;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-stats {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.restaurant-stats h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #e67e22;
}

.stat-label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.save-btn {
  background: linear-gradient(135deg, #e67e22, #f39c12);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn,
.back-btn {
  background: #95a5a6;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
}

.cancel-btn:hover,
.back-btn:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
  color: white;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state p,
.error-state p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
