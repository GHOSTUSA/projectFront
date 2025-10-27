<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "~/stores/authentification/AuthStore";
import type { User } from "~/types/User";

// Configuration pour le rendu côté client uniquement (CSR)
definePageMeta({
  ssr: false, // Force le rendu côté client
  auth: false, // Page publique, pas besoin d'authentification
});

// Configuration SEO pour la page de connexion
useSeoMeta({
  title: "Connexion - FoodDelivery",
  description:
    "Connectez-vous à votre compte FoodDelivery pour commander vos plats préférés en ligne.",
  robots: "noindex, nofollow", // Pas d'indexation pour les pages de connexion
});

// État réactif du formulaire
const userName = ref<string>("");
const passWord = ref<string>("");
const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");

/**
 * Vérification de l'authentification au montage du composant (CSR)
 */
onMounted(() => {
  try {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      // Redirection selon le rôle utilisateur
      redirectUserByRole(authStore.user);
    }
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification:", error);
  }
});

/**
 * Redirige l'utilisateur selon son rôle
 * @param user - Utilisateur connecté
 */
function redirectUserByRole(user: any) {
  if (user?.role === "admin") {
    navigateTo("/Admin/backOffice");
  } else if (user?.role === "restaurateur") {
    navigateTo("/Admin/restaurateur");
  } else {
    navigateTo("/utilisateur/restaurant");
  }
}

/**
 * Soumission du formulaire de connexion (CSR)
 * Utilise uniquement des requêtes côté client
 */
async function submitForm() {
  if (!userName.value || !passWord.value) {
    errorMessage.value = "Veuillez remplir tous les champs";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    console.log("Tentative de connexion côté client...");

    // Utilisation de $fetch côté client uniquement
    const data: any = await $fetch("/api/data.json");

    const user: User | undefined = data.users.find(
      (u: any) => u.email === userName.value && u.password === passWord.value
    );

    if (user) {
      console.log("Connexion réussie !", user.email);

      const authStore = useAuthStore();
      authStore.loginUser(user);

      // Redirection selon le rôle
      redirectUserByRole(user);
    } else {
      errorMessage.value = "Email ou mot de passe incorrect";
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    errorMessage.value = "Erreur de connexion. Veuillez réessayer.";
  } finally {
    isLoading.value = false;
  }
}

/**
 * Efface le message d'erreur
 */
function clearError() {
  errorMessage.value = "";
}
</script>
<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-content">
        <div class="login-header">
          <h1>Connexion</h1>
          <p>Bienvenue sur FoodDelivery</p>
        </div>

        <form @submit.prevent="submitForm" class="login-form">
          <!-- Message d'erreur -->
          <div v-if="errorMessage" class="error-message">
            <span>{{ errorMessage }}</span>
            <button type="button" @click="clearError" class="close-error">
              ×
            </button>
          </div>

          <div class="form-group">
            <label for="username">Email</label>
            <input
              v-model="userName"
              id="username"
              name="username"
              placeholder="Entrez votre email"
              :disabled="isLoading"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              v-model="passWord"
              id="password"
              name="password"
              placeholder="Entrez votre mot de passe"
              :disabled="isLoading"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="login-btn"
            :disabled="isLoading"
            :aria-label="isLoading ? 'Connexion en cours...' : 'Se connecter'"
          >
            <span v-if="isLoading" class="loading-spinner">⟳</span>
            {{ isLoading ? "Connexion..." : "Se connecter" }}
          </button>
        </form>
      </div>

      <div class="login-image">
        <div class="image-content">
          <h2>Découvrez nos restaurants</h2>
          <p>Commandez vos plats préférés en quelques clics</p>
          <div class="features">
            <div class="feature">
              <span class="feature-icon">●</span>
              <span>Large choix de restaurants</span>
            </div>
            <div class="feature">
              <span class="feature-icon">●</span>
              <span>Livraison rapide</span>
            </div>
            <div class="feature">
              <span class="feature-icon">●</span>
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(-90deg, #66ea7a 0%, #ffffff 80%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1000px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

.login-content {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 3rem;
}

.login-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.login-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-btn {
  width: 100%;
  background: linear-gradient(-90deg, #66ea7a 0%, #ffffff 80%);
  color: rgb(129, 129, 129);
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.close-error {
  background: none;
  border: none;
  color: #c33;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
}

.demo-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-top: 3px solid #27ae60;
}

.demo-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  text-align: center;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.demo-account {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.demo-account h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.demo-account p {
  margin: 0.25rem 0;
  font-family: monospace;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: #3498db;
  color: white;
}

.role-badge.restaurateur {
  background: #e67e22;
  color: white;
}

.role-badge.user {
  background: #27ae60;
  color: white;
}

.login-image {
  background: linear-gradient(
      135deg,
      rgba(39, 174, 96, 0.9),
      rgba(46, 204, 113, 0.9)
    ),
    url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: white;
}

.image-content {
  text-align: center;
}

.image-content h2 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.image-content > p {
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }

  .login-image {
    order: -1;
    min-height: 200px;
  }

  .login-content {
    padding: 2rem;
  }

  .login-header h1 {
    font-size: 2rem;
  }

  .image-content h2 {
    font-size: 1.5rem;
  }

  .features {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .feature {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem 0.5rem;
  }

  .login-content {
    padding: 1.5rem;
  }

  .login-header h1 {
    font-size: 1.8rem;
  }

  .demo-grid {
    gap: 0.75rem;
  }

  .demo-account {
    padding: 0.75rem;
  }
}
</style>
