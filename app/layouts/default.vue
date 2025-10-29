<!-- Layout principal avec navigation -->
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

const isMobileMenuOpen = ref(false);

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}

watch(
  [isAuthenticated, isAdmin, isRestaurateur],
  ([auth, admin, resto]) => {
    if (auth && admin && !route.path.startsWith("/Admin/backOffice")) {
      navigateTo("/Admin/backOffice");
    } else if (auth && resto && !route.path.startsWith("/Admin/restaurateur")) {
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
  navigateTo("/login");
  closeMobileMenu();
}
</script>

<template>
  <div class="user-layout">
    <header class="user-header">
      <nav class="user-nav">
        <NuxtLink to="/" class="nav-link">
          <div class="nav-brand">
            <h2>FoodDelivery</h2>
          </div>
        </NuxtLink>

        <div class="nav-controls">
          <LanguageSelector />

          <button
            class="mobile-menu-toggle"
            @click="toggleMobileMenu"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Toggle navigation menu"
          >
            <span
              class="hamburger-line"
              :class="{ open: isMobileMenuOpen }"
            ></span>
            <span
              class="hamburger-line"
              :class="{ open: isMobileMenuOpen }"
            ></span>
            <span
              class="hamburger-line"
              :class="{ open: isMobileMenuOpen }"
            ></span>
          </button>
        </div>

        <ul
          v-if="isAuthenticated && !isAdmin && !isRestaurateur"
          class="nav-menu"
          :class="{ 'mobile-open': isMobileMenuOpen }"
        >
          <li>
            <NuxtLink to="/utilisateur/restaurant" @click="closeMobileMenu">{{
              t("nav.restaurants")
            }}</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/utilisateur/panier" @click="closeMobileMenu">
              {{ t("nav.cart", { count: cartStore.cartItemCount }) }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/utilisateur/compte" @click="closeMobileMenu">{{
              t("nav.account")
            }}</NuxtLink>
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

        <ul
          v-else-if="!isAuthenticated"
          class="nav-menu guest-menu"
          :class="{ 'mobile-open': isMobileMenuOpen }"
        >
          <li>
            <NuxtLink to="/login" class="nav-link" @click="closeMobileMenu">{{
              t("nav.login")
            }}</NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/register"
              class="nav-link"
              @click="closeMobileMenu"
              >{{ t("nav.register") }}</NuxtLink
            >
          </li>
        </ul>
      </nav>
    </header>
    <main class="user-main">
      <slot />
    </main>
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
  position: relative;
}

.user-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.nav-brand h2 {
  color: white;
  margin: 0;
  font-weight: 600;
  font-size: 1.5rem;
  white-space: nowrap;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-line.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-line.open:nth-child(2) {
  opacity: 0;
}

.hamburger-line.open:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.5rem;
  align-items: center;
}

.nav-menu li a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: block;
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
  white-space: nowrap;
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
  white-space: nowrap;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.guest-menu {
  gap: 1rem;
}

.guest-menu .nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

.guest-menu .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.guest-menu .nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-main {
  min-height: calc(100vh - 80px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .user-nav {
    padding: 1rem 1.5rem;
  }

  .nav-menu {
    gap: 1rem;
  }

  .nav-brand h2 {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .user-nav {
    padding: 1rem;
    flex-wrap: wrap;
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 9;
  }

  .nav-menu.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-menu li {
    width: 100%;
  }

  .nav-menu li a,
  .logout-btn {
    width: 100%;
    text-align: center;
    padding: 0.75rem 1rem;
    margin: 0;
    box-sizing: border-box;
  }

  .user-info {
    text-align: center;
    margin: 0.5rem 0;
  }

  .nav-brand h2 {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .user-nav {
    padding: 0.75rem;
  }

  .nav-brand h2 {
    font-size: 1.1rem;
  }

  .nav-controls {
    gap: 0.5rem;
  }

  .nav-menu li a,
  .logout-btn {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }

  .user-info span {
    font-size: 0.85rem;
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
</style>
