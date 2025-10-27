import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtPlugin(() => {
  // Initialiser le store d'authentification côté client
  if (process.client) {
    nextTick(() => {
      try {
        const authStore = useAuthStore();
        console.log(
          "Store d'authentification initialisé:",
          authStore.isAuthenticated
        );
      } catch (error) {
        console.error("Erreur lors de l'initialisation du store:", error);
      }
    });
  }
});
