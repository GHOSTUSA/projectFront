<!-- Page Vue - Gestion des commandes pour restaurateur -->
<script setup lang="ts">
import { useAuthStore } from "~/stores/authentification/AuthStore";

definePageMeta({
  layout: "restaurateur",
  middleware: ["auth", "restaurateur"],
});

const authStore = useAuthStore();

const orders = ref<any[]>([]);
const users = ref<any[]>([]);
const loading = ref(true);
const selectedStatus = ref("all");

const statusOptions = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "in-progress", label: "En cours" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
];

onMounted(async () => {
  try {
    const data = await $fetch<any>("/api/data.json");
    const userRestaurantId = authStore.user?.restaurantId;

    orders.value = (data.commands || []).filter(
      (cmd: any) => cmd.restaurantId === userRestaurantId
    );
    users.value = data.users || [];
  } catch (error) {
    console.error("Erreur lors du chargement des commandes:", error);
  } finally {
    loading.value = false;
  }
});

const filteredOrders = computed(() => {
  if (selectedStatus.value === "all") {
    return orders.value;
  }
  return orders.value.filter((order) => order.status === selectedStatus.value);
});

const orderStats = computed(() => {
  const total = orders.value.length;
  const pending = orders.value.filter(
    (order) => order.status === "pending"
  ).length;
  const inProgress = orders.value.filter(
    (order) => order.status === "in-progress"
  ).length;
  const delivered = orders.value.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalRevenue = orders.value
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return { total, pending, inProgress, delivered, totalRevenue };
});

const getUserName = (userId: number) => {
  const user = users.value.find((u) => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : "Client inconnu";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

const updateOrderStatus = (orderId: number, newStatus: string) => {
  const orderIndex = orders.value.findIndex((order) => order.id === orderId);
  if (orderIndex !== -1) {
    orders.value[orderIndex].status = newStatus;

    if (newStatus === "delivered") {
      orders.value[orderIndex].deliveryDate = new Date().toISOString();
    }

    console.log(`Commande ${orderId} mise à jour: ${newStatus}`);
  }
};

const getOrderDetails = (order: any) => {
  return {
    itemsCount: order.items?.length || 0,
    customer: getUserName(order.userId),
    date: formatDate(order.orderDate),
    deliveryDate: order.deliveryDate ? formatDate(order.deliveryDate) : null,
  };
};
</script>

<template>
  <div class="orders-management">
    <div class="page-header">
      <h1>Gestion des Commandes</h1>
      <p>Suivez et gérez les commandes de votre restaurant</p>
    </div>

    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ orderStats.total }}</h3>
          <p>Total commandes</p>
        </div>
      </div>
      <div class="stat-card stat-warning">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ orderStats.pending }}</h3>
          <p>En attente</p>
        </div>
      </div>
      <div class="stat-card stat-info">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ orderStats.inProgress }}</h3>
          <p>En cours</p>
        </div>
      </div>
      <div class="stat-card stat-success">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ orderStats.delivered }}</h3>
          <p>Livrées</p>
        </div>
      </div>
      <div class="stat-card stat-revenue">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ orderStats.totalRevenue.toFixed(2) }}€</h3>
          <p>Chiffre d'affaires</p>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label for="status-filter">Filtrer par statut :</label>
        <select
          id="status-filter"
          v-model="selectedStatus"
          class="filter-select"
        >
          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="orders-list" v-if="!loading">
      <div v-if="filteredOrders.length === 0" class="no-orders">
        <h3>Aucune commande</h3>
        <p>Aucune commande trouvée pour ce filtre.</p>
      </div>

      <div v-else class="orders-grid">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-id">
              <h3>#{{ order.id }}</h3>
              <span :class="['badge', getStatusBadge(order.status).class]">
                {{ getStatusBadge(order.status).text }}
              </span>
            </div>
            <div class="order-price">{{ order.totalPrice }}€</div>
          </div>

          <div class="order-details">
            <p>
              <strong>Client:</strong> {{ getOrderDetails(order).customer }}
            </p>
            <p><strong>Commande:</strong> {{ getOrderDetails(order).date }}</p>
            <p v-if="getOrderDetails(order).deliveryDate">
              <strong>Livraison:</strong>
              {{ getOrderDetails(order).deliveryDate }}
            </p>
            <p>
              <strong>Articles:</strong>
              {{ getOrderDetails(order).itemsCount }} article(s)
            </p>
          </div>

          <div class="order-items">
            <h4>Articles commandés:</h4>
            <div class="items-list">
              <div
                v-for="item in order.items"
                :key="item.productId"
                class="item"
              >
                <span class="item-quantity">{{ item.quantity }}x</span>
                <span class="item-price">{{ item.unitPrice }}€</span>
              </div>
            </div>
          </div>

          <div class="order-actions">
            <label for="status-select">Statut:</label>
            <select
              :value="order.status"
              @change="
                updateOrderStatus(
                  order.id,
                  ($event.target as HTMLSelectElement).value
                )
              "
              class="status-select"
            >
              <option value="pending">En attente</option>
              <option value="in-progress">En cours</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <p>Chargement des commandes...</p>
    </div>
  </div>
</template>

<style scoped>
.orders-management {
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

.stat-card.stat-warning {
  border-left-color: #f39c12;
}
.stat-card.stat-info {
  border-left-color: #3498db;
}
.stat-card.stat-success {
  border-left-color: #27ae60;
}
.stat-card.stat-revenue {
  border-left-color: #8e44ad;
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

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.order-card:hover {
  transform: translateY(-5px);
}

.order-header {
  background: linear-gradient(135deg, #e67e22, #f39c12);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.order-price {
  font-size: 1.5rem;
  font-weight: bold;
}

.order-details {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f3f4;
}

.order-details p {
  margin: 0.5rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
}

.order-items {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f3f4;
}

.order-items h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.item-quantity {
  font-weight: 500;
  color: #2c3e50;
}

.item-price {
  font-weight: bold;
  color: #27ae60;
}

.order-actions {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-actions label {
  font-weight: 500;
  color: #2c3e50;
}

.status-select {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.status-select:focus {
  outline: none;
  border-color: #e67e22;
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge-warning {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}
.badge-info {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}
.badge-success {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}
.badge-danger {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.no-orders {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.no-orders h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.no-orders p {
  color: #7f8c8d;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
