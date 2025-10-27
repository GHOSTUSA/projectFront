<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";
import { useCartStore } from "~/stores/panier/cardStore";

const authStore = useAuthStore();
const cartStore = useCartStore();
const route = useRoute();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.user?.role === "admin");
const isRestaurateur = computed(() => authStore.user?.role === "restaurateur");

// Rediriger selon le rôle de l'utilisateur
watch(
  [isAuthenticated, isAdmin, isRestaurateur],
  ([auth, admin, resto]) => {
    if (auth && admin && !route.path.startsWith("/Admin/backOffice")) {
      // Administrateur connecté et pas déjà dans l'interface admin
      navigateTo("/Admin/backOffice");
    } else if (auth && resto && !route.path.startsWith("/Admin/restaurateur")) {
      // Restaurateur connecté et pas déjà dans l'interface restaurateur
      navigateTo("/Admin/restaurateur");
    }
  },
  { immediate: true }
);

watch(
  () => authStore.isAuthenticated,
  (newValue) => {
    console.log("État d'authentification changé:", newValue);
  },
  { immediate: true }
);

function logout() {
  authStore.logout();
  navigateTo("/");
}
</script>

<template>
  <div>
    <header v-if="isAuthenticated && !isAdmin && !isRestaurateur">
      <nav>
        <ul>
          <li><NuxtLink to="/utilisateur/restaurant">Restaurant</NuxtLink></li>
          <li><div @click="logout">Logout</div></li>
          <li>
            <NuxtLink to="/utilisateur/panier"
              >Panier ({{ cartStore.cartItemCount }})</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/utilisateur/compte">Compte</NuxtLink>
          </li>
        </ul>
      </nav>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
nav {
  background-color: #333;
  padding: 1rem;
}
nav ul {
  list-style: none;
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
}
nav ul li {
  color: white;
  cursor: pointer;
}
nav ul li a {
  color: white;
  text-decoration: none;
}
nav ul li a:hover {
  text-decoration: underline;
}
li div {
  float: right;
}
</style>
