import { useAuthStore } from "~/stores/authentification/AuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  // Ne pas exécuter côté serveur pour éviter les erreurs d'hydratation
  if (process.server) return;

  // Attendre que le client soit hydraté
  if (!process.client) return;

  const authStore = useAuthStore();

  // Pages publiques (accessible sans authentification)
  const publicPages = ["/"];

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée
  if (!authStore.isAuthenticated && !publicPages.includes(to.path)) {
    console.log(
      "Utilisateur non connecté, redirection vers la page de connexion"
    );
    return navigateTo("/");
  }

  // Si l'utilisateur est connecté et est sur la page de connexion, le rediriger vers les restaurants
  if (authStore.isAuthenticated && to.path === "/") {
    console.log("Utilisateur déjà connecté, redirection vers les restaurants");
    return navigateTo("/restaurant");
  }
});
