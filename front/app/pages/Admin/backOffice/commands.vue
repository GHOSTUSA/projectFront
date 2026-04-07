<!-- Page Vue - Gestion des commandes pour administrateurs -->
<script setup lang="ts">
const { t } = useI18n();

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"],
});

const commands = ref<any[]>([]);
const restaurants = ref<any[]>([]);
const users = ref<any[]>([]);
const loading = ref(true);
const selectedStatus = ref("all");

const statusOptions = [
  { value: "all", label: t("admin.commands.filters.all") },
  { value: "pending", label: t("admin.commands.filters.pending") },
  { value: "in-progress", label: t("admin.commands.filters.inProgress") },
  { value: "delivered", label: t("admin.commands.filters.delivered") },
  { value: "cancelled", label: t("admin.commands.filters.cancelled") },
];

onMounted(async () => {
  try {
    const data = await $fetch<any>("/api/data.json");
    commands.value = data.commands || [];
    restaurants.value = data.restaurants || [];
    users.value = data.users || [];
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  } finally {
    loading.value = false;
  }
});

const filteredCommands = computed(() => {
  if (selectedStatus.value === "all") {
    return commands.value;
  }
  return commands.value.filter((cmd) => cmd.status === selectedStatus.value);
});

const getRestaurantName = (restaurantId: number) => {
  const restaurant = restaurants.value.find((r) => r.id === restaurantId);
  return restaurant?.name || t("admin.commands.unknownRestaurant");
};

const getUserName = (userId: number) => {
  const user = users.value.find((u) => u.id === userId);
  return user
    ? `${user.firstName} ${user.lastName}`
    : t("admin.commands.unknownUser");
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
    pending: {
      class: "badge-warning",
      text: t("admin.commands.status.pending"),
    },
    "in-progress": {
      class: "badge-info",
      text: t("admin.commands.status.inProgress"),
    },
    delivered: {
      class: "badge-success",
      text: t("admin.commands.status.delivered"),
    },
    cancelled: {
      class: "badge-danger",
      text: t("admin.commands.status.cancelled"),
    },
  };
  return (
    badges[status as keyof typeof badges] || {
      class: "badge-secondary",
      text: t("admin.commands.status.unknown"),
    }
  );
};

const updateCommandStatus = async (commandId: number, newStatus: string) => {
  try {
    const commandIndex = commands.value.findIndex(
      (cmd) => cmd.id === commandId
    );
    if (commandIndex !== -1) {
      commands.value[commandIndex].status = newStatus;

      if (newStatus === "delivered") {
        commands.value[commandIndex].deliveryDate = new Date().toISOString();
      }
    }

    console.log(
      `Commande ${commandId} mise à jour avec le statut: ${newStatus}`
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
  }
};

const commandStats = computed(() => {
  const total = commands.value.length;
  const pending = commands.value.filter(
    (cmd) => cmd.status === "pending"
  ).length;
  const inProgress = commands.value.filter(
    (cmd) => cmd.status === "in-progress"
  ).length;
  const delivered = commands.value.filter(
    (cmd) => cmd.status === "delivered"
  ).length;

  return { total, pending, inProgress, delivered };
});
</script>

<template>
  <div class="commands-management">
    <div class="page-header">
      <h1>{{ t("admin.commands.title") }}</h1>
      <p>{{ t("admin.dashboard.welcome") }}</p>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-number">{{ commandStats.total }}</span>
        <span class="stat-label">{{ t("admin.commands.stats.total") }}</span>
      </div>
      <div class="stat-item stat-warning">
        <span class="stat-number">{{ commandStats.pending }}</span>
        <span class="stat-label">{{ t("admin.commands.stats.pending") }}</span>
      </div>
      <div class="stat-item stat-info">
        <span class="stat-number">{{ commandStats.inProgress }}</span>
        <span class="stat-label">{{
          t("admin.commands.stats.inProgress")
        }}</span>
      </div>
      <div class="stat-item stat-success">
        <span class="stat-number">{{ commandStats.delivered }}</span>
        <span class="stat-label">{{
          t("admin.commands.stats.delivered")
        }}</span>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="status-filter">{{ t("admin.orders.filters.label") }}</label>
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

    <div class="commands-table" v-if="!loading">
      <div class="table-header">
        <span>{{ t("admin.commands.table.id") }}</span>
        <span>{{ t("admin.commands.table.date") }}</span>
        <span>{{ t("admin.commands.table.customer") }}</span>
        <span>{{ t("admin.commands.table.restaurant") }}</span>
        <span>{{ t("admin.commands.table.total") }}</span>
        <span>{{ t("admin.commands.table.status") }}</span>
        <span>{{ t("admin.commands.table.actions") }}</span>
      </div>

      <div v-if="filteredCommands.length === 0" class="no-commands">
        <p>{{ t("admin.orders.empty.message") }}</p>
      </div>

      <div
        v-for="command in filteredCommands"
        :key="command.id"
        class="table-row"
      >
        <span class="command-id">#{{ command.id }}</span>
        <span class="command-date">{{ formatDate(command.orderDate) }}</span>
        <span class="command-user">{{ getUserName(command.userId) }}</span>
        <span class="command-restaurant">{{
          getRestaurantName(command.restaurantId)
        }}</span>
        <span class="command-price">{{ command.totalPrice }}€</span>
        <span class="command-status">
          <span :class="['badge', getStatusBadge(command.status).class]">
            {{ getStatusBadge(command.status).text }}
          </span>
        </span>
        <span class="command-actions">
          <select
            :value="command.status"
            @change="
              updateCommandStatus(
                command.id,
                ($event.target as HTMLSelectElement).value
              )
            "
            class="status-select"
          >
            <option value="pending">
              {{ t("admin.commands.status.pending") }}
            </option>
            <option value="in-progress">
              {{ t("admin.commands.status.inProgress") }}
            </option>
            <option value="delivered">
              {{ t("admin.commands.status.delivered") }}
            </option>
            <option value="cancelled">
              {{ t("admin.commands.status.cancelled") }}
            </option>
          </select>
        </span>
      </div>
    </div>

    <div v-else class="loading-state">
      <p>{{ t("admin.orders.loading") }}</p>
    </div>
  </div>
</template>

<style scoped>
.commands-management {
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid #3498db;
}

.stat-item.stat-warning {
  border-left-color: #f39c12;
}
.stat-item.stat-info {
  border-left-color: #3498db;
}
.stat-item.stat-success {
  border-left-color: #27ae60;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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

.commands-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 80px 140px 150px 150px 100px 120px 120px;
  padding: 1rem;
  gap: 1rem;
  align-items: center;
}

.table-header {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
  border-bottom: 2px solid #dee2e6;
}

.table-row {
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.command-id {
  font-weight: bold;
  color: #3498db;
}

.command-date {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.command-price {
  font-weight: bold;
  color: #27ae60;
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

.status-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  background: white;
  cursor: pointer;
}

.status-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.no-commands {
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 100px 120px 120px 80px 100px 100px;
    font-size: 0.8rem;
    padding: 0.75rem 0.5rem;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
