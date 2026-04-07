<!-- Page Vue - Compte utilisateur et historique des commandes -->
<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";
import { useCommandStore } from "~/stores/commande/commandStore";
import type { User, PublicUser } from "~/types/User";

const { t } = useI18n();

definePageMeta({
  middleware: "auth",
  ssr: false,
  requiresAuth: true,
});

useSeoMeta({
  title: t("account.seo.title"),
  description: t("account.seo.description"),
  robots: "noindex, nofollow",
});

const authStore = useAuthStore();
const commandStore = useCommandStore();

const user = ref<PublicUser | null>(null);
const isUpdating = ref<boolean>(false);
const updateMessage = ref<string>("");

onMounted(async () => {
  try {
    await commandStore.loadCommands();
    console.log("Commandes chargées côté client");
  } catch (error) {
    console.error("Erreur lors du chargement des commandes:", error);
  }
});

const userCommands = computed(() => commandStore.userCommands);

/**
 * Surveillance des changements d'utilisateur
 */
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      user.value = { ...newUser };
    }
  },
  { immediate: true }
);

/**
 * Mise à jour du profil utilisateur (CSR)
 */
async function updateProfile() {
  if (!user.value || !authStore.user) return;

  isUpdating.value = true;
  updateMessage.value = "";

  try {
    // Validation côté client
    if (!user.value.email || !user.value.firstName || !user.value.lastName) {
      updateMessage.value = t("account.allFieldsRequired");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(user.value.email)) {
      updateMessage.value = t("account.invalidEmail");
      return;
    }

    // Mise à jour via le store
    authStore.updateUser({
      email: user.value.email,
      lastName: user.value.lastName,
      firstName: user.value.firstName,
    });

    updateMessage.value = t("account.updateSuccess");
    console.log("Profil mis à jour côté client:", user.value);

    // Effacer le message après 3 secondes
    setTimeout(() => {
      updateMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    updateMessage.value = t("account.updateError");
  } finally {
    isUpdating.value = false;
  }
}
</script>

<template>
  <div class="account-page">
    <div v-if="user">
      <div class="page-header">
        <h1>{{ t("account.title") }}</h1>
        <p>
          {{
            t("account.welcome", {
              firstName: user.firstName,
              lastName: user.lastName,
            })
          }}
        </p>
      </div>

      <div class="profile-section">
        <h2>{{ t("account.personalInfo") }}</h2>
        <div class="profile-form">
          <!-- Message de mise à jour -->
          <div
            v-if="updateMessage"
            class="update-message"
            :class="{
              success: updateMessage.includes('succès'),
              error: !updateMessage.includes('succès'),
            }"
          >
            {{ updateMessage }}
          </div>

          <div class="form-group">
            <label for="email">{{ t("account.form.email") }} :</label>
            <input
              type="email"
              id="email"
              v-model="user.email"
              :placeholder="t('account.form.emailPlaceholder')"
              :disabled="isUpdating"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName">{{ t("account.form.lastName") }} :</label>
            <input
              type="text"
              id="lastName"
              v-model="user.lastName"
              :placeholder="t('account.form.lastNamePlaceholder')"
              :disabled="isUpdating"
              required
            />
          </div>

          <div class="form-group">
            <label for="firstName">{{ t("account.form.firstName") }} :</label>
            <input
              type="text"
              id="firstName"
              v-model="user.firstName"
              :placeholder="t('account.form.firstNamePlaceholder')"
              :disabled="isUpdating"
              required
            />
          </div>

          <button
            @click="updateProfile"
            class="update-btn"
            :disabled="isUpdating"
          >
            <span v-if="isUpdating" class="loading-spinner">⟳</span>
            {{
              isUpdating ? t("account.updating") : t("account.updateProfile")
            }}
          </button>
        </div>
      </div>

      <div class="commands-section">
        <h2>{{ t("account.myOrders") }}</h2>
        <div v-if="userCommands.length > 0" class="commands-list">
          <CommandCard
            v-for="command in userCommands"
            :key="command.id"
            :command="command"
          />
        </div>
        <div v-else class="no-commands">
          <h3>{{ t("account.noOrders") }}</h3>
          <p>{{ t("account.noOrdersMessage") }}</p>
          <NuxtLink to="/utilisateur/restaurant" class="browse-restaurants-btn">
            {{ t("account.browseRestaurants") }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      <p>{{ t("account.loading") }}</p>
    </div>
  </div>
</template>

<style scoped>
.account-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.page-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
}

.profile-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 3rem;
}

.profile-section h2 {
  color: #2c3e50;
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  text-align: center;
  border-bottom: 2px solid #27ae60;
  padding-bottom: 1rem;
}

.profile-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #27ae60;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.update-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1rem;
}

.update-btn:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
}

.update-btn:disabled {
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

.update-message {
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 500;
}

.update-message.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.update-message.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.commands-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.commands-section h2 {
  color: #2c3e50;
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  text-align: center;
  border-bottom: 2px solid #27ae60;
  padding-bottom: 1rem;
}

.commands-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.no-commands {
  text-align: center;
  padding: 4rem 2rem;
}

.no-commands h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.no-commands p {
  color: #7f8c8d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.browse-restaurants-btn {
  display: inline-block;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.browse-restaurants-btn:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.loading p {
  font-size: 1.1rem;
  color: #7f8c8d;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .account-page {
    padding: 1rem 0.5rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .profile-section,
  .commands-section {
    padding: 1.5rem;
  }

  .profile-section h2,
  .commands-section h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .profile-section,
  .commands-section {
    padding: 1rem;
  }

  .no-commands {
    padding: 2rem 1rem;
  }
}
</style>
