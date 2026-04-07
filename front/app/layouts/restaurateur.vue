<!-- Layout restaurateur -->
<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";

const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isRestaurateur = computed(() => authStore.user?.role === "restaurateur");

watch(
  [isAuthenticated, isRestaurateur],
  ([auth, resto]) => {
    if (auth && !resto) {
      if (authStore.user?.role === "admin") {
        navigateTo("/Admin/backOffice");
      } else {
        navigateTo("/restaurant");
      }
    } else if (!auth) {
      navigateTo("/");
    }
  },
  { immediate: true }
);

function logout() {
  authStore.logout();
  navigateTo("/");
}
</script>

<template>
  <div class="restaurateur-layout">
    <header
      v-if="isAuthenticated && isRestaurateur"
      class="restaurateur-header"
    >
      <nav class="restaurateur-nav">
        <div class="nav-brand">
          <h2>Espace Restaurateur</h2>
        </div>
        <ul class="nav-menu">
          <li><NuxtLink to="/Admin/restaurateur">Dashboard</NuxtLink></li>
          <li>
            <NuxtLink to="/Admin/restaurateur/restaurant"
              >Mon Restaurant</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/Admin/restaurateur/dishes">Mes Plats</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/Admin/restaurateur/orders">Commandes</NuxtLink>
          </li>
          <li class="user-info">
            <span
              >{{ authStore.user?.firstName }}
              {{ authStore.user?.lastName }}</span
            >
          </li>
          <li>
            <button @click="logout" class="logout-btn">Déconnexion</button>
          </li>
        </ul>
      </nav>
    </header>
    <main class="restaurateur-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.restaurateur-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.restaurateur-header {
  background: linear-gradient(135deg, #e67e22 0%, #f39c12 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid #d35400;
}

.restaurateur-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand h2 {
  color: white;
  margin: 0;
  font-weight: 600;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
  align-items: center;
}

.nav-menu li {
  margin-top: 2%;
}

.nav-menu li a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-menu li a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-menu li a.router-link-active {
  background-color: transparent;
  border-bottom: 2px solid white;
  box-shadow: 0 5px 13px rgba(77, 31, 1, 0.3);
}

.user-info span {
  color: #ecf0f1;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background-color: #d35400;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #a04000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(211, 84, 0, 0.3);
}

.restaurateur-main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

@media (max-width: 768px) {
  .restaurateur-nav {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .restaurateur-main {
    padding: 1rem;
  }
}
</style>
