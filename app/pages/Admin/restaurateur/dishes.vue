<script setup lang="ts">
import { useAuthStore } from "~/stores/authentification/AuthStore";

definePageMeta({
  layout: "restaurateur",
  middleware: ["auth", "restaurateur"],
});

const authStore = useAuthStore();

const dishes = ref<any[]>([]);
const loading = ref(true);
const showAddForm = ref(false);
const editingDish = ref<any>(null);

const newDish = ref({
  name: "",
  description: "",
  price: 0,
  category: "",
  image: "",
  allergens: [],
});

const categories = [
  "Appetizer",
  "Main Course",
  "Dessert",
  "Beverage",
  "Side Dish",
];

const availableAllergens = [
  "gluten",
  "dairy",
  "eggs",
  "nuts",
  "fish",
  "shellfish",
  "soy",
];

onMounted(async () => {
  try {
    const data = await $fetch<any>("/api/data.json");
    const userRestaurantId = authStore.user?.restaurantId;
    const restaurant = data.restaurants.find(
      (r: any) => r.id === userRestaurantId
    );

    if (restaurant) {
      dishes.value = restaurant.dishes || [];
    }
  } catch (error) {
    console.error("Erreur lors du chargement des plats:", error);
  } finally {
    loading.value = false;
  }
});

const addDish = () => {
  const newId =
    dishes.value.length > 0
      ? Math.max(...dishes.value.map((d) => d.id)) + 1
      : 1;

  const dish = {
    id: newId,
    ...newDish.value,
    price: Number(newDish.value.price),
  };

  dishes.value.push(dish);

  newDish.value = {
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    allergens: [],
  };

  showAddForm.value = false;

  console.log("Nouveau plat ajouté:", dish);
};

const editDish = (dish: any) => {
  editingDish.value = { ...dish };
};

const saveDish = () => {
  if (editingDish.value) {
    const index = dishes.value.findIndex((d) => d.id === editingDish.value.id);
    if (index !== -1) {
      dishes.value[index] = { ...editingDish.value };
    }
    editingDish.value = null;
    console.log("Plat modifié");
  }
};

const deleteDish = (dishId: number) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) {
    dishes.value = dishes.value.filter((d) => d.id !== dishId);
    console.log("Plat supprimé:", dishId);
  }
};

const cancelEdit = () => {
  editingDish.value = null;
};

const toggleAllergen = (allergen: string, dish: any) => {
  if (!dish.allergens) {
    dish.allergens = [];
  }

  const index = dish.allergens.indexOf(allergen);
  if (index > -1) {
    dish.allergens.splice(index, 1);
  } else {
    dish.allergens.push(allergen);
  }
};

const isAllergenSelected = (allergen: string, dish: any) => {
  return dish.allergens && dish.allergens.includes(allergen);
};
</script>

<template>
  <div class="dishes-management">
    <div class="page-header">
      <h1>Gestion du Menu</h1>
      <p>Gérez les plats de votre restaurant</p>
    </div>

    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ dishes.length }}</h3>
          <p>Plats au menu</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>
            {{
              dishes.length > 0
                ? (
                    dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length
                  ).toFixed(2)
                : "0"
            }}€
          </h3>
          <p>Prix moyen</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ [...new Set(dishes.map((d) => d.category))].length }}</h3>
          <p>Catégories</p>
        </div>
      </div>
    </div>

    <!-- Bouton d'ajout -->
    <div class="actions-section">
      <button @click="showAddForm = !showAddForm" class="add-btn">
        <span v-if="!showAddForm">Ajouter un plat</span>
        <span v-else>❌ Annuler</span>
      </button>
    </div>

    <!-- Formulaire d'ajout -->
    <div v-if="showAddForm" class="add-form">
      <h3>Nouveau Plat</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Nom du plat</label>
          <input v-model="newDish.name" type="text" placeholder="Nom du plat" />
        </div>
        <div class="form-group">
          <label>Prix (€)</label>
          <input
            v-model.number="newDish.price"
            type="number"
            min="0"
            step="0.1"
          />
        </div>
        <div class="form-group">
          <label>Catégorie</label>
          <select v-model="newDish.category">
            <option value="">Sélectionner une catégorie</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div class="form-group full-width">
          <label>Description</label>
          <textarea
            v-model="newDish.description"
            placeholder="Description du plat"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group full-width">
          <label>URL de l'image</label>
          <input v-model="newDish.image" type="url" placeholder="https://..." />
        </div>
        <div class="form-group full-width">
          <label>Allergènes</label>
          <div class="allergens-grid">
            <label
              v-for="allergen in availableAllergens"
              :key="allergen"
              class="allergen-checkbox"
            >
              <input
                type="checkbox"
                :checked="isAllergenSelected(allergen, newDish)"
                @change="toggleAllergen(allergen, newDish)"
              />
              <span>{{ allergen }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button @click="addDish" class="save-btn" :disabled="!newDish.name">
          Ajouter le plat
        </button>
      </div>
    </div>

    <div class="dishes-grid" v-if="!loading">
      <div v-for="dish in dishes" :key="dish.id" class="dish-card">
        <div v-if="editingDish?.id !== dish.id" class="dish-view">
          <div class="dish-image">
            <img :src="dish.image" :alt="dish.name" />
          </div>
          <div class="dish-info">
            <h3>{{ dish.name }}</h3>
            <p class="dish-description">{{ dish.description }}</p>
            <div class="dish-details">
              <span class="dish-price">{{ dish.price }}€</span>
              <span class="dish-category">{{ dish.category }}</span>
            </div>
            <div
              v-if="dish.allergens && dish.allergens.length > 0"
              class="dish-allergens"
            >
              <strong>Allergènes:</strong> {{ dish.allergens.join(", ") }}
            </div>
          </div>
          <div class="dish-actions">
            <button @click="editDish(dish)" class="edit-btn">Modifier</button>
            <button @click="deleteDish(dish.id)" class="delete-btn">
              Supprimer
            </button>
          </div>
        </div>

        <div v-else class="dish-edit">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom</label>
              <input v-model="editingDish.name" type="text" />
            </div>
            <div class="form-group">
              <label>Prix (€)</label>
              <input
                v-model.number="editingDish.price"
                type="number"
                min="0"
                step="0.1"
              />
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <select v-model="editingDish.category">
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea v-model="editingDish.description" rows="3"></textarea>
            </div>
            <div class="form-group full-width">
              <label>Image URL</label>
              <input v-model="editingDish.image" type="url" />
            </div>
            <div class="form-group full-width">
              <label>Allergènes</label>
              <div class="allergens-grid">
                <label
                  v-for="allergen in availableAllergens"
                  :key="allergen"
                  class="allergen-checkbox"
                >
                  <input
                    type="checkbox"
                    :checked="isAllergenSelected(allergen, editingDish)"
                    @change="toggleAllergen(allergen, editingDish)"
                  />
                  <span>{{ allergen }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="edit-actions">
            <button @click="saveDish" class="save-btn">Sauvegarder</button>
            <button @click="cancelEdit" class="cancel-btn">Annuler</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && dishes.length === 0" class="empty-state">
      <h3>Aucun plat au menu</h3>
      <p>Commencez par ajouter votre premier plat !</p>
      <button @click="showAddForm = true" class="add-btn">
        Ajouter votre premier plat
      </button>
    </div>

    <div v-else class="loading-state">
      <p>Chargement des plats...</p>
    </div>
  </div>
</template>

<style scoped>
.dishes-management {
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
  border-left: 4px solid #e67e22;
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
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #e67e22;
  box-shadow: 0 0 0 2px rgba(230, 126, 34, 0.2);
}

.allergens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.allergen-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.allergen-checkbox:hover {
  background: #f8f9fa;
}

.allergen-checkbox input {
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.save-btn {
  background: #e67e22;
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

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.dish-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.dish-card:hover {
  transform: translateY(-5px);
}

.dish-image {
  height: 200px;
  overflow: hidden;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-view {
  display: flex;
  flex-direction: column;
}

.dish-info {
  padding: 1.5rem;
  flex-grow: 1;
}

.dish-info h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.dish-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.dish-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dish-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #27ae60;
}

.dish-category {
  background: #e67e22;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.dish-allergens {
  font-size: 0.8rem;
  color: #e74c3c;
}

.dish-actions {
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

.dish-edit {
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .dishes-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .allergens-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
