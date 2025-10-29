<!-- Page Vue - Création de compte utilisateur -->
<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";
import type { CreateUserRequest } from "~/types/Api";

const { t } = useI18n();

definePageMeta({
  ssr: false,
  requiresAuth: false,
});

useSeoMeta({
  title: t("account.seo.creationTitle"),
  description: t("account.seo.creationDescription"),
  robots: "index, follow",
});

const authStore = useAuthStore();
const router = useRouter();

// Données réactives du formulaire
const formData = reactive<CreateUserRequest>({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "user",
});

const loading = ref(false);
const error = ref<string | null>(null);
const showPassword = ref(false);

// Validation en temps réel
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(formData.email);
});

const isValidPassword = computed(() => {
  return formData.password.length >= 8;
});

const isFormValid = computed(() => {
  return (
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    isValidEmail.value &&
    isValidPassword.value
  );
});

// Fonction de création de compte
const createAccount = async () => {
  if (!isFormValid.value) {
    error.value = "Veuillez corriger les erreurs du formulaire";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Simulation de la création de compte (à remplacer par un vrai appel API)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Pour la simulation, on crée un utilisateur fictif
    const newUser = {
      id: Date.now(), // ID temporaire
      ...formData,
      createdAt: new Date().toISOString(),
    };

    // Connecter l'utilisateur automatiquement après création
    authStore.loginUser(newUser);

    // Rediriger vers la page d'accueil
    await router.push("/");

    // Notification de succès (optionnel - si vous avez un système de toast)
    // $toast?.success?.("Compte créé avec succès ! Bienvenue sur FoodDelivery.");
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Erreur lors de la création du compte";
  } finally {
    loading.value = false;
  }
};

// Réinitialiser l'erreur quand l'utilisateur modifie le formulaire
watch(
  () => [formData.email, formData.password],
  () => {
    if (error.value) error.value = null;
  }
);
</script>

<template>
  <div class="account-creation-container">
    <div class="form-wrapper">
      <div class="form-header">
        <h1 class="form-title">Créer un compte</h1>
        <p class="form-subtitle">
          Rejoignez FoodDelivery et découvrez les meilleurs restaurants près de
          chez vous
        </p>
      </div>

      <form @submit.prevent="createAccount" class="creation-form">
        <!-- Nom et Prénom -->
        <div class="form-row">
          <div class="form-group">
            <label for="firstName" class="form-label">Prénom *</label>
            <input
              type="text"
              id="firstName"
              v-model="formData.firstName"
              class="form-input"
              :class="{
                error: !formData.firstName.trim() && formData.firstName,
              }"
              placeholder="Votre prénom"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">Nom *</label>
            <input
              type="text"
              id="lastName"
              v-model="formData.lastName"
              class="form-input"
              :class="{ error: !formData.lastName.trim() && formData.lastName }"
              placeholder="Votre nom"
              required
            />
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label">Email *</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            class="form-input"
            :class="{
              error: formData.email && !isValidEmail,
              success: isValidEmail,
            }"
            placeholder="votre.email@exemple.com"
            required
          />
          <span v-if="formData.email && !isValidEmail" class="error-text">
            Format d'email invalide
          </span>
        </div>

        <!-- Mot de passe -->
        <div class="form-group">
          <label for="password" class="form-label">Mot de passe *</label>
          <div class="password-input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="formData.password"
              class="form-input"
              :class="{
                error: formData.password && !isValidPassword,
                success: isValidPassword,
              }"
              placeholder="Minimum 8 caractères"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="password-toggle"
              :aria-label="
                showPassword
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              "
            >
              <Icon :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
            </button>
          </div>
          <span v-if="formData.password && !isValidPassword" class="error-text">
            Le mot de passe doit contenir au moins 8 caractères
          </span>
        </div>

        <!-- Message d'erreur global -->
        <div v-if="error" class="error-message">
          <Icon name="mdi:alert-circle" />
          {{ error }}
        </div>

        <!-- Boutons -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary"
            :disabled="!isFormValid || loading"
          >
            <Icon v-if="loading" name="mdi:loading" class="spinning" />
            <span>{{
              loading ? "Création en cours..." : "Créer mon compte"
            }}</span>
          </button>

          <p class="login-link">
            Vous avez déjà un compte ?
            <NuxtLink to="/login" class="link">Se connecter</NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.account-creation-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(-90deg, #66ea7a 0%, #ffffff 80%);
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.form-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 450px;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
}

.creation-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
}

.form-input.success {
  border-color: #38a169;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #2c3e50;
}

.error-text {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fed7d7;
  color: #e53e3e;
  border-radius: 8px;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(-90deg, #66ea7a 0%, #ffffff 80%);
  color: rgb(129, 129, 129);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinning {
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

.login-link {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 640px) {
  .account-creation-container {
    padding: 0.5rem;
  }

  .form-wrapper {
    padding: 1.5rem 1rem;
    max-width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .form-wrapper {
    padding: 1rem;
  }

  .form-title {
    font-size: 1.4rem;
  }
}
</style>
