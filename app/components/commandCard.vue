<template>
  <div class="command-card">
    <div class="command-header">
      <h3>Commande #{{ command.id }}</h3>
      <span :class="['status', command.status]">
        {{ getStatusText(command.status) }}
      </span>
    </div>

    <div class="command-info">
      <p><strong>Restaurant:</strong> {{ restaurantName }}</p>
      <p>
        <strong>Date de commande:</strong> {{ formatDate(command.orderDate) }}
      </p>
      <p v-if="command.deliveryDate">
        <strong>Date de livraison:</strong>
        {{ formatDate(command.deliveryDate) }}
      </p>
      <p><strong>Prix total:</strong> {{ command.totalPrice.toFixed(2) }}€</p>
    </div>

    <div class="command-items">
      <h4>Articles commandés:</h4>
      <div class="items-list">
        <div v-for="item in command.items" :key="item.productId" class="item">
          <span class="item-name">{{ getDishName(item.productId) }}</span>
          <span class="item-quantity">x{{ item.quantity }}</span>
          <span class="item-price">{{ item.unitPrice.toFixed(2) }}€</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Command } from "~/types/Command";

interface Props {
  command: Command;
}

const props = defineProps<Props>();

// Récupération des données depuis data.json
const data = await $fetch<{ restaurants: any[] }>("/api/data.json");
const restaurants = data.restaurants;

const restaurantName = computed(() => {
  const restaurant = restaurants.find(
    (r: any) => r.id === props.command.restaurantId
  );
  return restaurant?.name || "Restaurant inconnu";
});

const getDishName = (productId: number) => {
  for (const restaurant of restaurants) {
    const dish = restaurant.dishes?.find((d: any) => d.id === productId);
    if (dish) return dish.name;
  }
  return "Plat inconnu";
};

const getStatusText = (status: string) => {
  const statusMap = {
    pending: "En attente",
    "in-progress": "En préparation",
    delivered: "Livré",
    cancelled: "Annulé",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.command-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.command-header h3 {
  margin: 0;
  color: #333;
}

.status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status.in-progress {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status.delivered {
  background-color: #d4edda;
  color: #155724;
}

.status.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.command-info {
  margin-bottom: 20px;
}

.command-info p {
  margin: 8px 0;
  color: #666;
}

.command-items h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.items-list {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  font-weight: 500;
}

.item-quantity {
  margin: 0 12px;
  color: #666;
}

.item-price {
  font-weight: 600;
  color: #28a745;
}
</style>
