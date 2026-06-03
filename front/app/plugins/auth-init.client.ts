/* Plugin d'initialisation de l'authentification côté client */
import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();

  if (import.meta.client) {
    await authStore.initializeAuth();
  }
});
