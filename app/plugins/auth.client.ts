/** Plugin Nuxt - Initialisation du store d'authentification côté client */
import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtPlugin(() => {
  if (process.client) {
    nextTick(() => {
      try {
        const authStore = useAuthStore();
      } catch (error) {
        console.error("Erreur lors de l'initialisation du store:", error);
      }
    });
  }
});
