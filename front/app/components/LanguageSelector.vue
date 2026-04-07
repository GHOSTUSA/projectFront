<!-- Composant Vue - Toggle de langue simple FR/EN -->
<script lang="ts" setup>
const { locale, setLocale } = useI18n();
const { t } = useI18n();

const isEnglish = computed(() => locale.value === "en");

async function toggleLanguage() {
  const newLocale = isEnglish.value ? "fr" : "en";
  await setLocale(newLocale);

  const { announceSuccess } = useScreenReaderAnnouncements();
  const languageName = newLocale === "fr" ? "Français" : "English";
  announceSuccess(t("messages.languageChanged", { language: languageName }));
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleLanguage();
  }
}
</script>

<template>
  <div
    class="language-toggle"
    role="region"
    :aria-label="t('accessibility.languageSelector.label')"
  >
    <button
      class="toggle-button btn-accessible"
      :aria-label="
        t('accessibility.languageSelector.switchTo', {
          language: isEnglish ? 'Français' : 'English',
        })
      "
      type="button"
      @click="toggleLanguage"
      @keydown="handleKeydown"
    >
      <!-- Langue actuelle seulement -->
      <span class="current-lang">
        <span
          class="language-flag"
          :class="`flag-${locale}`"
          aria-hidden="true"
        ></span>
        <span class="language-name">{{
          isEnglish ? "English" : "Français"
        }}</span>
      </span>
    </button>

    <!-- Texte caché pour les lecteurs d'écran -->
    <span class="sr-only" aria-live="polite" aria-atomic="true">
      {{ t("accessibility.languageSelector.currentLanguage") }}:
      {{ isEnglish ? "English" : "Français" }}
    </span>
  </div>
</template>

<style scoped>
.language-toggle {
  display: inline-block;
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 44px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-button:hover {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.2);
}

.toggle-button:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

.toggle-button:active {
  transform: translateY(0);
}

.current-lang {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-flag {
  width: 20px;
  height: 15px;
  border-radius: 2px;
  display: inline-block;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.flag-fr {
  background-image: linear-gradient(
    90deg,
    #002395 33%,
    #ffffff 33% 66%,
    #ed2939 66%
  );
}

.flag-en {
  background: linear-gradient(
    to bottom,
    #012169 0%,
    #012169 25%,
    #ffffff 25%,
    #ffffff 35%,
    #dc143c 35%,
    #dc143c 65%,
    #ffffff 65%,
    #ffffff 75%,
    #012169 75%,
    #012169 100%
  );
}

.language-name {
  font-weight: 600;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .toggle-button {
    padding: 6px 12px;
    gap: 6px;
  }

  .language-flag {
    width: 18px;
    height: 13px;
  }

  .language-name {
    font-size: 13px;
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .toggle-button {
    background: #2c3e50;
    border-color: #404040;
    color: #ffffff;
  }

  .toggle-button:hover {
    background: rgba(39, 174, 96, 0.2);
    border-color: #27ae60;
  }
}

/* Classes utilitaires */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
