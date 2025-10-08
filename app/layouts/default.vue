<script lang="ts" setup>
import { AuthStore } from "~/stores/authentification/AuthStore";

const authStore = AuthStore();

function logout() {
  authStore.logout();
  navigateTo("/");
}
</script>

<template>
  <div>
    <header v-if="authStore.isAuthenticated">
      <nav>
        <ul>
          <li><NuxtLink to="/restaurant">Restaurant</NuxtLink></li>
          <li><div @click="logout">Logout</div></li>
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
main {
  padding: 1rem;
}
</style>
