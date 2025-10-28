<!-- Page Vue - Dashboard administrateur avec statistiques -->
<script setup lang="ts">
import { useAuthStore } from "~/stores/authentification/AuthStore";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"],
});

const authStore = useAuthStore();

const stats = ref({
  totalUsers: 0,
  totalRestaurants: 0,
  totalCommands: 0,
  pendingCommands: 0,
  todayRevenue: 0,
});

onMounted(async () => {
  try {
    const data = await $fetch<any>("/api/data.json");

    stats.value = {
      totalUsers: data.users?.length || 0,
      totalRestaurants: data.restaurants?.length || 0,
      totalCommands: data.commands?.length || 0,
      pendingCommands:
        data.commands?.filter((c: any) => c.status === "pending").length || 0,
      todayRevenue:
        data.commands?.reduce(
          (total: number, cmd: any) => total + (cmd.totalPrice || 0),
          0
        ) || 0,
    };
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
  }
});

const recentCommands = ref<any[]>([]);

onMounted(async () => {
  try {
    const data = await $fetch<any>("/api/data.json");
    recentCommands.value = (data.commands || [])
      .sort(
        (a: any, b: any) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
      .slice(0, 5);
  } catch (error) {
    console.error("Erreur lors du chargement des commandes récentes:", error);
  }
});

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
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard Administrateur</h1>
      <p>
        Bienvenue {{ authStore.user?.firstName }}, voici un aperçu de votre
        plateforme
      </p>
    </div>

    <div class="stats-grid">
      <!-- <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.totalUsers }}</h3>
          <p>Utilisateurs</p>
        </div>
      </div> -->

      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.totalRestaurants }}</h3>
          <p>Restaurants</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.totalCommands }}</h3>
          <p>Commandes totales</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.pendingCommands }}</h3>
          <p>En attente</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-content">
          <h3>{{ stats.todayRevenue.toFixed(2) }}€</h3>
          <p>Chiffre d'affaires</p>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Actions rapides</h2>
      <div class="actions-grid">
        <NuxtLink to="/Admin/backOffice/restaurants" class="action-card">
          <div class="action-icon"></div>
          <h3>Gérer les restaurants</h3>
          <p>Ajouter, modifier ou supprimer des restaurants</p>
        </NuxtLink>

        <NuxtLink to="/Admin/backOffice/commands" class="action-card">
          <div class="action-icon"></div>
          <h3>Gérer les commandes</h3>
          <p>Suivre et modifier le statut des commandes</p>
        </NuxtLink>
      </div>
    </div>

    <div class="recent-orders">
      <h2>Commandes récentes</h2>
      <div class="orders-table">
        <div class="table-header">
          <span>ID</span>
          <span>Date</span>
          <span>Utilisateur</span>
          <span>Montant</span>
          <span>Statut</span>
        </div>
        <div
          v-for="command in recentCommands"
          :key="command.id"
          class="table-row"
        >
          <span>#{{ command.id }}</span>
          <span>{{ formatDate(command.orderDate) }}</span>
          <span>User {{ command.userId }}</span>
          <span>{{ command.totalPrice }}€</span>
          <span>
            <span :class="['badge', getStatusBadge(command.status).class]">
              {{ getStatusBadge(command.status).text }}
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem 0;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
  color: #2c3e50;
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
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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

.recent-orders h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.orders-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 80px 150px 1fr 100px 120px;
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
.badge-secondary {
  background-color: #e2e3e5;
  color: #383d41;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px 120px 1fr 80px 100px;
    font-size: 0.8rem;
  }
}
</style>
