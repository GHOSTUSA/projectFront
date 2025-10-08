<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";
import { useCartStore } from "~/stores/panier/cardStore";

const authStore = ref<any>(null);
const isAuthenticated = ref(false);
const cartStore = useCartStore();

onMounted(() => {
  try {
    authStore.value = useAuthStore();
    isAuthenticated.value = authStore.value?.isAuthenticated || false;
  } catch (error) {
    console.error("Erreur d'initialisation du store dans le layout:", error);
  }
});

function logout() {
  if (authStore.value) {
    authStore.value.logout();
    isAuthenticated.value = false;
    navigateTo("/");
  }
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
