<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "~/stores/authentification/AuthStore";
import type { User } from "~/types/User";

let userName = ref<string>("");
let passWord = ref<string>("");

// Vérification d'authentification côté client uniquement
onMounted(() => {
  try {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      // Redirection selon le rôle
      if (authStore.user?.role === 'admin') {
        navigateTo("/Admin/backOffice");
      } else if (authStore.user?.role === 'restaurateur') {
        navigateTo("/Admin/restaurateur");
      } else {
        navigateTo("/utilisateur/restaurant");
      }
    }
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification:", error);
  }
});

async function submitForm() {
  console.log("Nom d'utilisateur:", userName.value);
  console.log("Mot de passe:", passWord.value);

  try {
    const data: any = await $fetch("/api/data.json");

    const user: User | undefined = data.users.find(
      (u: any) => u.email === userName.value && u.password === passWord.value
    );

    if (user) {
      console.log("Connexion réussie !");
      console.log("Utilisateur connecté:", user);

      const authStore = useAuthStore();
      authStore.login(user);
      
      // Redirection selon le rôle après connexion
      if (user.role === 'admin') {
        navigateTo("/Admin/backOffice");
      } else if (user.role === 'restaurateur') {
        navigateTo("/Admin/restaurateur");
      } else {
        navigateTo("/utilisateur/restaurant");
      }
    } else {
      console.log("Identifiants incorrects");
      alert("Nom d'utilisateur ou mot de passe incorrect");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    alert("Erreur lors de la connexion");
  }
}
</script>
<template>
  <div id="all">
    <div>
      <h1>Connexion</h1>
      <p>Bienvenue sur la page de connexion</p>
    </div>
    <div>
      <div>
        <label for="username">Nom d'utilisateur:</label>
        <input
          type="text"
          v-model="userName"
          id="username"
          name="username"
          required
        />
      </div>
      <div>
        <label for="password">Mot de passe:</label>
        <input
          type="password"
          v-model="passWord"
          id="password"
          name="password"
          required
        />
      </div>
      <button @click="submitForm()">Se connecter</button>
    </div>
  </div>
</template>

<style scoped>
#all {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
}
#all div {
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
