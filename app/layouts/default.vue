<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";
import { useCartStore } from "~/stores/panier/cardStore";

const authStore = useAuthStore();
const cartStore = useCartStore();

// Utiliser computed pour que la navbar soit réactive
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Watcher pour s'assurer que les changements sont bien détectés
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
    <header v-if="isAuthenticated">
      <nav>
        <ul>
          <li><NuxtLink to="/restaurant">Restaurant</NuxtLink></li>
          <li><div @click="logout">Logout</div></li>
          <li>
            <NuxtLink to="/panier"
              >Panier ({{ cartStore.cartItemCount }})</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/compte">Compte</NuxtLink>
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
