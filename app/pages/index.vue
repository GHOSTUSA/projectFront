<!-- Page d'accueil - Redirection intelligente -->
<script setup lang="ts">
import { useAuthStore } from "~/stores/authentification/AuthStore";

definePageMeta({
  ssr: false,
  auth: false,
});

const authStore = useAuthStore();

onMounted(() => {
  // Redirection basée sur l'état d'authentification
  if (authStore.isAuthenticated) {
    const user = authStore.user;
    if (user?.role === "admin") {
      navigateTo("/Admin/backOffice");
    } else if (user?.role === "restaurateur") {
      navigateTo("/Admin/restaurateur");
    } else {
      // Utilisateur normal - aller vers restaurants
      navigateTo("/utilisateur/restaurant");
    }
  } else {
    // Non connecté - aller vers restaurants (public)
    navigateTo("/utilisateur/restaurant");
  }
});
</script>

<template>
  <div class="loading-page">
    <div class="loading-content">
      <h1>FoodDelivery</h1>
      <div class="loading-spinner">⟳</div>
      <p>Chargement...</p>
    </div>
  </div>
</template>

<style scoped>
.loading-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
}

.loading-content {
  text-align: center;
}

.loading-content h1 {
  font-size: 3rem;
  margin-bottom: 2rem;
  font-weight: 600;
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}
</style>
