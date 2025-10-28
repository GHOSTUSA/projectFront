/** Middleware - Gestion de l'authentification et redirections */
import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return;

  if (!process.client) return;

  const authStore = useAuthStore();

  const publicPages = ["/", "/restaurant/", "/restaurant/[id]"];

  if (!authStore.isAuthenticated && !publicPages.includes(to.path)) {
    console.log(
      "Utilisateur non connecté, redirection vers la page de connexion"
    );
    return navigateTo("/");
  }

  if (authStore.isAuthenticated && to.path === "/") {
    console.log("Utilisateur déjà connecté, redirection selon le rôle");

    if (authStore.user?.role === "admin") {
      return navigateTo("/Admin/backOffice");
    } else if (authStore.user?.role === "restaurateur") {
      return navigateTo("/Admin/restaurateur");
    } else {
      return navigateTo("/utilisateur/restaurant");
    }
  }
});
