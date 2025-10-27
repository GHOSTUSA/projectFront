<script setup lang="ts">
import { useAuthStore } from "~/stores/authentification/AuthStore";

definePageMeta({
  layout: "restaurateur",
  middleware: ["auth", "restaurateur"],
});

const authStore = useAuthStore();

const restaurant = ref<any>(null);
const stats = ref({
  todayOrders: 0,
  totalRevenue: 0,
  activeMenuItems: 0,
  averageRating: 0,
});

const recentOrders = ref<any[]>([]);

onMounted(async () => {
  try {
    const data = await $fetch<any>("/api/data.json");

    const userRestaurantId = authStore.user?.restaurantId;
    restaurant.value = data.restaurants.find(
      (r: any) => r.id === userRestaurantId
    );

    if (restaurant.value) {
      const restaurantOrders =
        data.commands?.filter(
          (cmd: any) => cmd.restaurantId === userRestaurantId
        ) || [];
      const today = new Date().toISOString().split("T")[0];
      const todayOrders = restaurantOrders.filter((cmd: any) =>
        cmd.orderDate.startsWith(today)
      );

      stats.value = {
        todayOrders: todayOrders.length,
        totalRevenue: restaurantOrders.reduce(
          (total: number, cmd: any) => total + (cmd.totalPrice || 0),
          0
        ),
        activeMenuItems: restaurant.value.dishes?.length || 0,
        averageRating: restaurant.value.averageRating || 0,
      };

      recentOrders.value = restaurantOrders
        .sort(
          (a: any, b: any) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        )
        .slice(0, 5);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  }
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: string) => {
  const badges = {
    pending: { class: "badge-warning", text: "En attente" },
    "in-progress": { class: "badge-info", text: "En cours" },
    delivered: { class: "badge-success", text: "Livré" },
    cancelled: { class: "badge-danger", text: "Annulé" },
  };
  return (
    badges[status as keyof typeof badges] || {
      class: "badge-secondary",
      text: status,
    }
  );
};
</script>

<template>
  <div class="restaurateur-dashboard">
    <div class="dashboard-header">
      <h1>Dashboard Restaurateur</h1>
      <p v-if="restaurant">
        Bienvenue {{ authStore.user?.firstName }}, gérez votre restaurant "{{
          restaurant.name
        }}"
      </p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.todayOrders }}</h3>
          <p>Commandes aujourd'hui</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.totalRevenue.toFixed(2) }}€</h3>
          <p>Chiffre d'affaires total</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.activeMenuItems }}</h3>
          <p>Plats au menu</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.averageRating }}/5</h3>
          <p>Note moyenne</p>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Actions rapides</h2>
      <div class="actions-grid">
        <NuxtLink to="/Admin/restaurateur/restaurant" class="action-card">
          <div class="action-icon"></div>
          <h3>Mon Restaurant</h3>
          <p>Modifier les informations de votre restaurant</p>
        </NuxtLink>

        <NuxtLink to="/Admin/restaurateur/dishes" class="action-card">
          <div class="action-icon"></div>
          <h3>Gestion du Menu</h3>
          <p>Ajouter, modifier ou supprimer des plats</p>
        </NuxtLink>

        <NuxtLink to="/Admin/restaurateur/orders" class="action-card">
          <div class="action-icon"></div>
          <h3>Commandes</h3>
          <p>Voir et gérer les commandes reçues</p>
        </NuxtLink>
      </div>
    </div>

    <div class="recent-orders" v-if="recentOrders.length > 0">
      <h2>Commandes récentes</h2>
      <div class="orders-table">
        <div class="table-header">
          <span>ID</span>
          <span>Date</span>
          <span>Montant</span>
          <span>Statut</span>
        </div>
        <div v-for="order in recentOrders" :key="order.id" class="table-row">
          <span>#{{ order.id }}</span>
          <span>{{ formatDate(order.orderDate) }}</span>
          <span>{{ order.totalPrice }}€</span>
          <span>
            <span :class="['badge', getStatusBadge(order.status).class]">
              {{ getStatusBadge(order.status).text }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="restaurant-info" v-if="restaurant">
      <h2>Votre Restaurant</h2>
      <div class="restaurant-card">
        <div class="restaurant-image">
          <img :src="restaurant.image" :alt="restaurant.name" />
        </div>
        <div class="restaurant-details">
          <h3>{{ restaurant.name }}</h3>
          <p><strong>Adresse:</strong> {{ restaurant.address }}</p>
          <p><strong>Téléphone:</strong> {{ restaurant.phone }}</p>
          <p><strong>Type:</strong> {{ restaurant.cuisineType }}</p>
          <p><strong>Note:</strong> {{ restaurant.averageRating }}/5</p>
          <NuxtLink to="/Admin/restaurateur/restaurant" class="edit-btn">
            Modifier
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.restaurateur-dashboard {
  padding: 2rem 0;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #e67e22;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
  border-left: 4px solid #e67e22;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.stat-content p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
}

.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  color: #e67e22;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  text-align: center;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-5px);
  border-color: #e67e22;
  color: inherit;
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.action-card p {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.recent-orders h2,
.restaurant-info h2 {
  color: #e67e22;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.orders-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 80px 150px 100px 120px;
  padding: 1rem;
  gap: 1rem;
  align-items: center;
}

.table-header {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
  border-bottom: 1px solid #dee2e6;
}

.table-row {
  border-bottom: 1px solid #f1f3f4;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}
.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
}
.badge-success {
  background-color: #d4edda;
  color: #155724;
}
.badge-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.restaurant-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  gap: 2rem;
}

.restaurant-image {
  width: 300px;
  height: 200px;
  flex-shrink: 0;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-details {
  padding: 2rem;
  flex-grow: 1;
}

.restaurant-details h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.restaurant-details p {
  margin: 0.5rem 0;
  color: #7f8c8d;
}

.edit-btn {
  display: inline-block;
  background: #e67e22;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.edit-btn:hover {
  background: #d35400;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .restaurant-card {
    flex-direction: column;
  }

  .restaurant-image {
    width: 100%;
  }
}
</style>
