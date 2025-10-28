<!-- Page d'inscription -->
<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "~/stores/authentification/AuthStore";
import type { User } from "~/types/User";

definePageMeta({
  ssr: false,
  auth: false,
});

useSeoMeta({
  title: "Créer un compte - FoodDelivery",
  description:
    "Créez votre compte FoodDelivery et commandez vos plats préférés en ligne.",
  robots: "noindex, nofollow",
});

const formData = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");
const successMessage = ref<string>("");

onMounted(() => {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated) {
    navigateTo("/utilisateur/restaurant");
  }
});

function validateForm(): boolean {
  if (!formData.value.firstName.trim()) {
    errorMessage.value = "Le prénom est requis";
    return false;
  }

  if (!formData.value.lastName.trim()) {
    errorMessage.value = "Le nom est requis";
    return false;
  }

  if (!formData.value.email.trim()) {
    errorMessage.value = "L'email est requis";
    return false;
  }

  if (!formData.value.password.trim()) {
    errorMessage.value = "Le mot de passe est requis";
    return false;
  }

  return true;
}
async function submitForm() {
  errorMessage.value = "";
  successMessage.value = "";

  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    // Simuler la création du compte
    const newUser: User = {
      id: Date.now(), // ID temporaire
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      password: formData.value.password,
      role: "user", // Tous les utilisateurs sont des clients classiques
      createdAt: new Date().toISOString(),
    };

    console.log("Nouveau compte créé (simulation):", newUser);

    // Dans un vrai app, on ferait un POST vers l'API
    // const response = await $fetch('/api/users', { method: 'POST', body: newUser })

    successMessage.value = "Compte créé avec succès ! Connexion automatique...";

    // Connexion automatique
    setTimeout(() => {
      const authStore = useAuthStore();
      authStore.loginUser(newUser);

      // Tous les utilisateurs vont sur la page restaurant
      navigateTo("/utilisateur/restaurant");
    }, 1500);
  } catch (error) {
    console.error("Erreur lors de la création du compte:", error);
    errorMessage.value =
      "Erreur lors de la création du compte. Veuillez réessayer.";
  } finally {
    isLoading.value = false;
  }
}
function clearMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-content">
        <div class="register-header">
          <h1>Créer un compte</h1>
          <p>Rejoignez FoodDelivery dès aujourd'hui</p>
        </div>

        <form @submit.prevent="submitForm" class="register-form">
          <!-- Messages -->
          <div v-if="errorMessage" class="error-message">
            <span>{{ errorMessage }}</span>
            <button type="button" @click="clearMessages" class="close-message">
              ×
            </button>
          </div>

          <div v-if="successMessage" class="success-message">
            <span>{{ successMessage }}</span>
          </div>

          <!-- Nom et prénom -->
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom *</label>
              <input
                type="text"
                v-model="formData.firstName"
                id="firstName"
                name="firstName"
                placeholder="Votre prénom"
                :disabled="isLoading"
                required
                autocomplete="given-name"
              />
            </div>

            <div class="form-group">
              <label for="lastName">Nom *</label>
              <input
                type="text"
                v-model="formData.lastName"
                id="lastName"
                name="lastName"
                placeholder="Votre nom"
                :disabled="isLoading"
                required
                autocomplete="family-name"
              />
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              v-model="formData.email"
              id="email"
              name="email"
              placeholder="votre@email.com"
              :disabled="isLoading"
              required
              autocomplete="email"
            />
          </div>

          <!-- Mots de passe -->
          <div class="form-row">
            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <input
                type="password"
                v-model="formData.password"
                id="password"
                name="password"
                placeholder="Votre mot de passe"
                :disabled="isLoading"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <button type="submit" class="register-btn" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner">⟳</span>
            {{ isLoading ? "Création..." : "Créer mon compte" }}
          </button>
        </form>

        <div class="login-link">
          <p>Vous avez déjà un compte ?</p>
          <NuxtLink to="/" class="login-btn-link">Se connecter</NuxtLink>
        </div>
      </div>

      <div class="register-image">
        <div class="image-content">
          <h2>Bienvenue dans la famille !</h2>
          <p>Découvrez des centaines de restaurants</p>
          <div class="benefits">
            <div class="benefit">
              <span>Livraison gratuite dès 25€</span>
            </div>
            <div class="benefit">
              <span>Restaurants sélectionnés</span>
            </div>
            <div class="benefit">
              <span>Paiement 100% sécurisé</span>
            </div>
            <div class="benefit">
              <span>Suivi en temps réel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(-90deg, #66ea7a 0%, #ffffff 80%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.register-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 700px;
}

.register-content {
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.register-header p {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.875rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-group input:focus {
  outline: none;
  border-color: #27ae60;
  background: white;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.register-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message,
.success-message {
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
}

.success-message {
  background: #efe;
  border: 1px solid #cfc;
  color: #3c3;
}

.close-message {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  color: inherit;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.login-link p {
  margin: 0 0 0.75rem 0;
  color: #7f8c8d;
}

.login-btn-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}

.login-btn-link:hover {
  text-decoration: underline;
}

.register-image {
  background: linear-gradient(
      135deg,
      rgba(39, 174, 96, 0.9),
      rgba(46, 204, 113, 0.9)
    ),
    url("https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80");
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
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.image-content > p {
  font-size: 1rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.benefits {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  text-align: center;
}

.benefit-icon {
  font-size: 1.5rem;
}

.benefit span:last-child {
  font-size: 0.85rem;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .register-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }

  .register-image {
    order: -1;
    min-height: 200px;
  }

  .register-content {
    padding: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .benefits {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .benefit {
    flex-direction: row;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .register-page {
    padding: 1rem 0.5rem;
  }

  .register-content {
    padding: 1.5rem;
  }

  .register-header h1 {
    font-size: 1.8rem;
  }
}
</style>
