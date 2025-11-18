<!-- Gestionnaire PWA pour installation et mises à jour -->
<script lang="ts" setup>
const isInstallable = ref(false);
const isInstalled = ref(false);
const isOffline = ref(false);
const hasUpdate = ref(false);
const showInstallPrompt = ref(false);

let deferredPrompt: any = null;

const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine;
};

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault();
  deferredPrompt = e;
  isInstallable.value = true;
  setTimeout(() => {
    showInstallPrompt.value = true;
  }, 3000);
};

const installPWA = async () => {
  if (!deferredPrompt) return;

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      isInstalled.value = true;
      showInstallPrompt.value = false;

      const { $notify } = useNuxtApp();
      if ($notify) {
        $notify.success("Application installée avec succès !");
      }
    }

    deferredPrompt = null;
    isInstallable.value = false;
  } catch (error) {
    console.error("Erreur lors de l'installation PWA:", error);
  }
};

const dismissInstallPrompt = () => {
  showInstallPrompt.value = false;

  // Reporter l'affichage du prompt
  setTimeout(() => {
    if (isInstallable.value && !isInstalled.value) {
      showInstallPrompt.value = true;
    }
  }, 24 * 60 * 60 * 1000); // 24 heures
};

// Gestion des mises à jour du Service Worker
const handleSWUpdate = () => {
  hasUpdate.value = true;
};

// Application de la mise à jour
const applyUpdate = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    });
  }

  // Recharger la page
  window.location.reload();
};

// Initialisation au montage du composant
onMounted(() => {
  // Vérification si l'app est déjà installée
  if (
    window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches
  ) {
    isInstalled.value = true;
  }

  // Écouteurs d'événements
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  // État initial de la connexion
  updateOnlineStatus();

  // Écoute des mises à jour du Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_UPDATED") {
        handleSWUpdate();
      }
    });
  }
});

// Nettoyage au démontage
onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});
</script>

<template>
  <div class="pwa-manager">
    <!-- Notification mode offline -->
    <Transition name="fade">
      <div
        v-if="isOffline"
        class="offline-banner"
        role="alert"
        aria-live="assertive"
      >
        <div class="offline-content">
          <span class="offline-icon" aria-hidden="true">📱</span>
          <span class="offline-text">Mode hors ligne activé</span>
          <p class="offline-description">
            Certaines fonctionnalités peuvent être limitées
          </p>
        </div>
      </div>
    </Transition>

    <!-- Prompt d'installation PWA -->
    <Transition name="slide-up">
      <div
        v-if="showInstallPrompt && !isInstalled"
        class="install-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        aria-describedby="install-description"
      >
        <div class="install-content">
          <div class="install-header">
            <h3 id="install-title">Installer FoodDelivery</h3>
            <button
              @click="dismissInstallPrompt"
              class="install-close"
              aria-label="Fermer le prompt d'installation"
            >
              ×
            </button>
          </div>

          <p id="install-description" class="install-description">
            Installez l'application pour un accès rapide et une meilleure
            expérience !
          </p>

          <div class="install-features">
            <div class="feature">
              <span class="feature-icon">⚡</span>
              <span>Accès rapide</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📱</span>
              <span>Mode hors ligne</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔔</span>
              <span>Notifications</span>
            </div>
          </div>

          <div class="install-actions">
            <button @click="installPWA" class="install-btn primary">
              Installer
            </button>
            <button @click="dismissInstallPrompt" class="install-btn secondary">
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Notification de mise à jour disponible -->
    <Transition name="slide-up">
      <div
        v-if="hasUpdate"
        class="update-prompt"
        role="alert"
        aria-live="polite"
      >
        <div class="update-content">
          <div class="update-info">
            <span class="update-icon" aria-hidden="true">🔄</span>
            <div>
              <h4>Mise à jour disponible</h4>
              <p>Une nouvelle version de l'application est prête</p>
            </div>
          </div>
          <button @click="applyUpdate" class="update-btn">Mettre à jour</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pwa-manager {
  position: relative;
  z-index: 1000;
}

/* Bannière mode offline */
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1001;
}

.offline-content {
  max-width: 600px;
  margin: 0 auto;
}

.offline-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.offline-text {
  font-weight: 600;
  font-size: 1rem;
}

.offline-description {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Prompt d'installation */
.install-prompt {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  max-width: 400px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1002;
  border: 1px solid #e0e0e0;
}

.install-content {
  padding: 1.5rem;
}

.install-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.install-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.install-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.install-close:hover {
  background-color: #f8f9fa;
}

.install-description {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.install-features {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.feature-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.feature span:last-child {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.install-actions {
  display: flex;
  gap: 0.75rem;
}

.install-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.install-btn.primary {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.install-btn.primary:hover {
  background: linear-gradient(135deg, #229954, #27ae60);
  transform: translateY(-1px);
}

.install-btn.secondary {
  background: #f8f9fa;
  color: #7f8c8d;
  border: 1px solid #e0e0e0;
}

.install-btn.secondary:hover {
  background: #e9ecef;
}

/* Prompt de mise à jour */
.update-prompt {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  max-width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  z-index: 1002;
  border: 1px solid #e0e0e0;
}

.update-content {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.update-icon {
  font-size: 1.5rem;
}

.update-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #2c3e50;
}

.update-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.update-btn {
  background: linear-gradient(135deg, #3498db, #74b9ff);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.update-btn:hover {
  background: linear-gradient(135deg, #2980b9, #3498db);
  transform: translateY(-1px);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .install-prompt {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }

  .update-prompt {
    right: 1rem;
    bottom: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .install-features {
    justify-content: space-around;
  }

  .update-content {
    flex-direction: column;
    align-items: stretch;
  }

  .update-btn {
    align-self: center;
    padding: 0.75rem 2rem;
  }
}
</style>
