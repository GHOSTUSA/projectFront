<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";
import type { User } from "~/types/User";

const authStore = useAuthStore();

const user = ref<User | null>(null);

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
  <div v-if="user">
    <h1>Mon compte</h1>
    <p>Bienvenue {{ user.firstName }} {{ user.lastName }}</p>

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
    <commandCard :user="user" />
  </div>

  <div v-else class="loading">
    <p>Chargement...</p>
  </div>
</template>

<style scoped>
.profile-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.update-btn {
  background-color: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.update-btn:hover {
  background-color: #0056b3;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: #666;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
}

p {
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
}
</style>
