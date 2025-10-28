<!-- Layout Vue - Template principal avec navigation et footer -->
<script lang="ts" setup>
import { useAuthStore } from "~/stores/authentification/AuthStore";
import { useCartStore } from "~/stores/panier/cardStore";

const { t } = useI18n();

const LanguageSelector = defineAsyncComponent({
  loader: () => import("~/components/LanguageSelector.vue"),
  loadingComponent: defineComponent({
    template: `
      <div class="language-selector-skeleton" role="status" aria-label="Chargement du sélecteur de langue">
        <div class="skeleton-flag"></div>
        <div class="skeleton-text"></div>
      </div>
    `,
  }),
  delay: 50,
  timeout: 2000,
});

const authStore = useAuthStore();
const cartStore = useCartStore();
const route = useRoute();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.user?.role === "admin");
const isRestaurateur = computed(() => authStore.user?.role === "restaurateur");

// Rediriger selon le rôle de l'utilisateur
watch(
  [isAuthenticated, isAdmin, isRestaurateur],
  ([auth, admin, resto]) => {
    if (auth && admin && !route.path.startsWith("/Admin/backOffice")) {
      // Administrateur connecté et pas déjà dans l'interface admin
      navigateTo("/Admin/backOffice");
    } else if (auth && resto && !route.path.startsWith("/Admin/restaurateur")) {
      // Restaurateur connecté et pas déjà dans l'interface restaurateur
      navigateTo("/Admin/restaurateur");
    }
  },
  { immediate: true }
);

watch(
  () => authStore.isAuthenticated,
  (newValue) => {
    console.log("État d'authentification changé:", newValue);
  },
  { immediate: true }
);

function logout() {
  authStore.logout();
  navigateTo("/");
}
</script>

<template>
  <div class="user-layout">
    <header
      v-if="isAuthenticated && !isAdmin && !isRestaurateur"
      class="user-header"
    >
      <nav class="user-nav">
        <div class="nav-brand">
          <h2>FoodDelivery</h2>
        </div>

        <!-- Sélecteur de langue accessible -->
        <LanguageSelector />

        <ul class="nav-menu">
          <li>
            <NuxtLink to="/utilisateur/restaurant">{{
              t("nav.restaurants")
            }}</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/utilisateur/panier">
              {{ t("nav.cart", { count: cartStore.cartItemCount }) }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/utilisateur/compte">{{ t("nav.account") }}</NuxtLink>
          </li>
          <li class="user-info">
            <span
              >{{ authStore.user?.firstName }}
              {{ authStore.user?.lastName }}</span
            >
          </li>
          <li>
            <button @click="logout" class="logout-btn">
              {{ t("nav.logout") }}
            </button>
          </li>
        </ul>
      </nav>
    </header>
    <main class="user-main">
      <slot />
    </main>

    <!-- Gestionnaire PWA temporairement désactivé -->
    <!-- <PWAManager /> -->
  </div>
</template>

<style scoped>
.user-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.user-header {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid #229954;
}

.user-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
}

.user-nav > :nth-child(2) {
  margin-left: auto;
  margin-right: 1rem;
}

.nav-brand h2 {
  color: white;
  margin: 0;
  font-weight: 600;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
  align-items: center;
}

.nav-menu li a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-menu li a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-menu li a.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-info {
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.user-main {
  min-height: calc(100vh - 80px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-nav {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .nav-menu {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    width: 100%;
  }

  .nav-menu li:last-child {
    grid-column: 1 / -1;
  }

  .nav-brand h2 {
    font-size: 1.2rem;
  }
}

/* Language Selector Skeleton */
.language-selector-skeleton {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
}

.skeleton-flag {
  width: 24px;
  height: 18px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s infinite;
  border-radius: 3px;
}

.skeleton-text {
  width: 40px;
  height: 16px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-wave {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes skeleton-pulse {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

@media (max-width: 480px) {
  .user-nav {
    padding: 0.5rem;
  }

  .nav-brand {
    width: 100%;
    text-align: center;
    margin-bottom: 0.75rem;
  }

  .nav-brand h2 {
    font-size: 1.1rem;
    margin: 0;
  }

  .nav-menu {
    flex-direction: column;
    width: 100%;
    gap: 0.25rem;
  }

  .nav-menu li a,
  .logout-btn {
    /* width: 100%; */
    text-align: center;
    display: block;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .user-info {
    margin: 0;
    text-align: center;
  }

  .user-info span {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
