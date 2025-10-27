import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  if (!process.client) return;

  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    console.log("Accès admin refusé: utilisateur non connecté");
    return navigateTo("/");
  }

  if (authStore.user?.role !== "admin") {
    console.log("Accès admin refusé: rôle insuffisant");
    return navigateTo("/restaurant");
  }

  console.log("Accès admin autorisé pour:", authStore.user.email);
});
