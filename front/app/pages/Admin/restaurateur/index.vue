<!-- Page Vue - Dashboard restaurateur avec statistiques -->
<script setup lang="ts">
import { useAuthStore } from "~/stores/authentification/AuthStore";

definePageMeta({
  layout: "restaurateur",
  middleware: ["auth", "restaurateur"],
});

const authStore = useAuthStore();

const restaurant = ref<any>(null);
const restaurantMissing = ref(false);
const loadingRestaurant = ref(true);
const stats = ref({
  todayOrders: 0,
  totalRevenue: 0,
  activeMenuItems: 0,
  averageRating: 0,
});

const recentOrders = ref<any[]>([]);

const normalizeOrderStatus = (status?: string) => {
  const normalized = (status || "").toUpperCase();

  if (normalized === "DELIVERED") return "delivered";
  if (normalized === "CANCELLED") return "cancelled";
  if (["CONFIRMED", "PREPARING", "READY"].includes(normalized)) {
    return "in-progress";
  }

  return "pending";
};

const getOrderDate = (order: any) => order.orderDate || order.createdAt || null;

onMounted(async () => {
  try {
    loadingRestaurant.value = true;
    const token = authStore.token;
    if (!token) throw new Error("Token manquant");

    // Récupérer le restaurant du restaurateur connecté
    const rawRestaurant = await $fetch<any>("http://localhost:8082/api/restaurants/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    restaurant.value = {
      ...rawRestaurant,
      phone: rawRestaurant.phone ?? rawRestaurant.phoneNumber ?? "",
      image: rawRestaurant.image ?? rawRestaurant.picture ?? "",
      averageRating: rawRestaurant.averageRating ?? rawRestaurant.rating ?? 0,
    };
    restaurantMissing.value = false;

    try {
      // Récupérer les commandes du restaurant
      const restaurantOrders = await $fetch<any[]>("http://localhost:8082/api/orders/restaurant", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dishes = await $fetch<any[]>(
        `http://localhost:8082/api/dishes/restaurant/${restaurant.value.id}`,
      );

      const mappedOrders = restaurantOrders.map((order) => ({
        ...order,
        orderDate: getOrderDate(order),
        status: normalizeOrderStatus(order.status),
      }));

      const today = new Date().toISOString().split("T")[0] || "";
      const todayOrders = mappedOrders.filter((cmd: any) => {
        if (!cmd.orderDate) return false;
        return String(cmd.orderDate).startsWith(today);
      });

      stats.value = {
        todayOrders: todayOrders.length,
        totalRevenue: mappedOrders.reduce((total: number, cmd: any) => total + (cmd.totalPrice || 0), 0),
        activeMenuItems: dishes.length || 0,
        averageRating: restaurant.value.averageRating || 0,
      };

      recentOrders.value = mappedOrders
        .sort((a: any, b: any) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime())
        .slice(0, 5);
    } catch (ordersError) {
      console.error("Erreur lors du chargement des commandes du restaurant:", ordersError);
      recentOrders.value = [];
      stats.value = {
        todayOrders: 0,
        totalRevenue: 0,
        activeMenuItems: 0,
        averageRating: restaurant.value.averageRating || 0,
      };
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    restaurant.value = null;
    restaurantMissing.value = true;
    stats.value = {
      todayOrders: 0,
      totalRevenue: 0,
      activeMenuItems: 0,
      averageRating: 0,
    };
  } finally {
    loadingRestaurant.value = false;
  }
});

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
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
      <p v-else>
        Bienvenue {{ authStore.user?.firstName }}, créez votre restaurant pour
        accéder à l'interface admin.
      </p>
    </div>

    <div v-if="restaurantMissing && !loadingRestaurant" class="empty-state">
      <div class="empty-card">
        <h2>Aucun restaurant associé</h2>
        <p>
          Vous devez d'abord créer votre restaurant pour gérer le menu et les
          commandes.
        </p>
        <NuxtLink to="/Admin/restaurateur/restaurant" class="empty-cta">
          Créer mon restaurant
        </NuxtLink>
      </div>
    </div>

    <div class="stats-grid" v-if="restaurant || loadingRestaurant === false">
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
          <h3>{{ restaurant ? "Mon Restaurant" : "Créer mon restaurant" }}</h3>
          <p>
            {{
              restaurant
                ? "Modifier les informations de votre restaurant"
                : "Créer votre restaurant et le raccorder à votre compte"
            }}
          </p>
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

    <div class="recent-orders" v-if="recentOrders.length > 0 && restaurant">
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

.empty-state {
  display: flex;
  justify-content: center;
  margin: 0 0 2rem;
}

.empty-card {
  background: #fff8f1;
  border: 1px solid #f2c18d;
  border-radius: 16px;
  padding: 2rem;
  max-width: 720px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 24px rgba(230, 126, 34, 0.08);
}

.empty-card h2 {
  color: #c45a00;
  margin-bottom: 0.75rem;
}

.empty-card p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.empty-cta {
  display: inline-block;
  background: #e67e22;
  color: white;
  padding: 0.9rem 1.4rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
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
