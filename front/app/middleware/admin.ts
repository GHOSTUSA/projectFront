/** Middleware - Contrôle d'accès administrateur */
import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  if (!process.client) return;

  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }

  if (authStore.user?.role !== "admin") {
    return navigateTo("/utilisateur/restaurant");
  }
});
