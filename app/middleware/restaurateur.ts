/** Middleware - Contrôle d'accès restaurateur */
import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  if (!process.client) return;

  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    console.log("Accès restaurateur refusé: utilisateur non connecté");
    return navigateTo("/login");
  }

  if (authStore.user?.role !== "restaurateur") {
    console.log("Accès restaurateur refusé: rôle insuffisant");
    if (authStore.user?.role === "admin") {
      return navigateTo("/Admin/backOffice");
    } else {
      return navigateTo("/utilisateur/restaurant");
    }
  }

  console.log("Accès restaurateur autorisé pour:", authStore.user.email);
});
