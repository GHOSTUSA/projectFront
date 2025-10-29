import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  // Initialiser l'état d'authentification au démarrage côté client
  if (import.meta.client) {
    authStore.initializeAuth();
  }
});
