/** Middleware - Contrôle d'accès restaurateur */
import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  if (!process.client) return;

  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }

  if (authStore.user?.role !== "restaurateur") {
    if (authStore.user?.role === "admin") {
      return navigateTo("/Admin/backOffice");
    } else {
      return navigateTo("/utilisateur/restaurant");
    }
  }
});
