<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";
import { useCommandStore } from "~/stores/commande/commandStore";
import type { User } from "~/types/User";

// Appliquer le middleware d'authentification
definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const commandStore = useCommandStore();

const user = ref<User | null>(null);

// Charger les commandes au montage du composant
onMounted(async () => {
  await commandStore.loadCommands();
});

// Commandes de l'utilisateur via le getter du store
const userCommands = computed(() => commandStore.userCommands);

watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      user.value = { ...newUser };
    }
  },
  { immediate: true }
);

function updateProfile() {
  if (user.value && authStore.user) {
    authStore.user.email = user.value.email;
    authStore.user.lastName = user.value.lastName;
    authStore.user.firstName = user.value.firstName;

    console.log("Profil mis à jour:", user.value);
  }
}
</script>

<template>
  <div class="account-page">
    <div v-if="user">
      <div class="page-header">
        <h1>Mon Compte</h1>
        <p>Bienvenue {{ user.firstName }} {{ user.lastName }}</p>
      </div>

      <div class="profile-section">
        <h2>Informations personnelles</h2>
        <div class="profile-form">
          <div class="form-group">
            <label for="email">Email :</label>
            <input
              type="email"
              id="email"
              v-model="user.email"
              placeholder="Votre email"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Nom :</label>
            <input
              type="text"
              id="lastName"
              v-model="user.lastName"
              placeholder="Votre nom"
            />
          </div>

          <div class="form-group">
            <label for="firstName">Prénom :</label>
            <input
              type="text"
              id="firstName"
              v-model="user.firstName"
              placeholder="Votre prénom"
            />
          </div>

          <button @click="updateProfile" class="update-btn">
            Mettre à jour le profil
          </button>
        </div>
      </div>

      <div class="commands-section">
        <h2>Mes commandes</h2>
        <div v-if="userCommands.length > 0" class="commands-list">
          <CommandCard
            v-for="command in userCommands"
            :key="command.id"
            :command="command"
          />
        </div>
        <div v-else class="no-commands">
          <h3>Aucune commande</h3>
          <p>Vous n'avez pas encore passé de commandes.</p>
          <NuxtLink to="/utilisateur/restaurant" class="browse-restaurants-btn">
            Découvrir nos restaurants
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      <p>Chargement de votre compte...</p>
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
