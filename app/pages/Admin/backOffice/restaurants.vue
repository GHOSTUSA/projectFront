<!-- Page Vue - Gestion des restaurants pour administrateurs -->
<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"],
});

const restaurants = ref<any[]>([]);
const loading = ref(true);
const showAddForm = ref(false);
const editingRestaurant = ref<any>(null);

const newRestaurant = ref({
  name: "",
  address: "",
  phone: "",
  cuisineType: "",
  averageRating: 4.0,
  image: "",
});

onMounted(async () => {
  try {
    const data = await $fetch<any>("/api/data.json");
    restaurants.value = data.restaurants || [];
  } catch (error) {
    console.error("Erreur lors du chargement des restaurants:", error);
  } finally {
    loading.value = false;
  }
});

const addRestaurant = () => {
  const newId =
    restaurants.value.length > 0
      ? Math.max(...restaurants.value.map((r) => r.id)) + 1
      : 1;

  const restaurant = {
    id: newId,
    ...newRestaurant.value,
    dishes: [],
  };

  restaurants.value.push(restaurant);

  newRestaurant.value = {
    name: "",
    address: "",
    phone: "",
    cuisineType: "",
    averageRating: 4.0,
    image: "",
  };

  showAddForm.value = false;

  console.log("Nouveau restaurant ajouté:", restaurant);
};

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
</script>

<template>
  <div class="restaurants-management">
    <div class="page-header">
      <h1>Gestion des Restaurants</h1>
      <p>Gérez les restaurants partenaires de votre plateforme</p>
    </div>

    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ restaurants.length }}</h3>
          <p>Restaurants actifs</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>
            {{
              restaurants.reduce(
                (total, r) => total + (r.dishes?.length || 0),
                0
              )
            }}
          </h3>
          <p>Plats disponibles</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>
            {{
              restaurants.length > 0
                ? (
                    restaurants.reduce(
                      (total, r) => total + r.averageRating,
                      0
                    ) / restaurants.length
                  ).toFixed(1)
                : "0"
            }}
          </h3>
          <p>Note moyenne</p>
        </div>
      </div>
    </div>

    <div class="actions-section">
      <button @click="showAddForm = !showAddForm" class="add-btn">
        <span v-if="!showAddForm">Ajouter un restaurant</span>
        <span v-else>Annuler</span>
      </button>
    </div>

    <div v-if="showAddForm" class="add-form">
      <h3>Nouveau Restaurant</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Nom du restaurant</label>
          <input
            v-model="newRestaurant.name"
            type="text"
            placeholder="Nom du restaurant"
          />
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input
            v-model="newRestaurant.address"
            type="text"
            placeholder="Adresse complète"
          />
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input
            v-model="newRestaurant.phone"
            type="text"
            placeholder="Numéro de téléphone"
          />
        </div>
        <div class="form-group">
          <label>Type de cuisine</label>
          <select v-model="newRestaurant.cuisineType">
            <option value="">Sélectionner un type</option>
            <option v-for="type in cuisineTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Note moyenne</label>
          <input
            v-model.number="newRestaurant.averageRating"
            type="number"
            min="0"
            max="5"
            step="0.1"
          />
        </div>
        <div class="form-group full-width">
          <label>URL de l'image</label>
          <input
            v-model="newRestaurant.image"
            type="url"
            placeholder="https://..."
          />
        </div>
      </div>
      <div class="form-actions">
        <button
          @click="addRestaurant"
          class="save-btn"
          :disabled="!newRestaurant.name"
        >
          Ajouter le restaurant
        </button>
      </div>
    </div>

    <div class="restaurants-grid" v-if="!loading">
      <div
        v-for="restaurant in restaurants"
        :key="restaurant.id"
        class="restaurant-card"
      >
        <!-- Mode visualisation seulement pour les admins -->
        <div class="restaurant-view">
          <div class="restaurant-image">
            <img :src="restaurant.image" :alt="restaurant.name" />
          </div>
          <div class="restaurant-info">
            <h3>{{ restaurant.name }}</h3>
            <p class="restaurant-address">📍 {{ restaurant.address }}</p>
            <p class="restaurant-phone">📞 {{ restaurant.phone }}</p>
            <p class="restaurant-cuisine">🍽️ {{ restaurant.cuisineType }}</p>
            <div class="restaurant-rating">
              ⭐ {{ restaurant.averageRating }}/5
            </div>
            <div class="restaurant-dishes">
              {{ restaurant.dishes?.length || 0 }} plats disponibles
            </div>
          </div>
          <div class="restaurant-info-note">
            <p>
              <em
                >ℹ️ Seuls les restaurateurs peuvent modifier leur restaurant</em
              >
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <p>Chargement des restaurants...</p>
    </div>
  </div>
</template>

<style scoped>
.restaurants-management {
  padding: 1rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #7f8c8d;
  font-size: 1rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.stat-content p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
}

.actions-section {
  margin-bottom: 2rem;
}

.add-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
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

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.add-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.add-form h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.save-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.restaurants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.restaurant-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.restaurant-card:hover {
  transform: translateY(-5px);
}

.restaurant-image {
  height: 200px;
  overflow: hidden;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-view {
  display: flex;
  flex-direction: column;
}

.restaurant-info {
  padding: 1.5rem;
  flex-grow: 1;
}

.restaurant-info h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.restaurant-info p {
  margin: 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.restaurant-rating {
  background: #f39c12;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

.restaurant-dishes {
  color: #27ae60;
  font-weight: 500;
  font-size: 0.9rem;
}

.restaurant-info-note {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.restaurant-info-note p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
  text-align: center;
}

.restaurant-actions {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  display: flex;
  gap: 1rem;
}

.edit-btn {
  background: #f39c12;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
}

.restaurant-edit {
  padding: 1.5rem;
}

.edit-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .restaurants-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
