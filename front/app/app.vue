<!-- Application Vue - Configuration principale avec Pinia et layouts  -->
<script lang="ts" setup>
import { createPinia } from "pinia";
import { createApp } from "vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./app.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
const app = createApp(App);
app.use(pinia);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
