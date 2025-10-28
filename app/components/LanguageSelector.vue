<!-- Composant Vue - Sélecteur de langue avec i18n -->
<script lang="ts" setup>
const { locale, locales, setLocale } = useI18n();
const { t } = useI18n();

const availableLocales = computed(() => {
  return locales.value.filter((l) => l.code !== locale.value);
});

const currentLocale = computed(() => {
  return locales.value.find((l) => l.code === locale.value);
});

async function switchLanguage(code: string) {
  await setLocale(code);

  const { announceSuccess } = useScreenReaderAnnouncements();
  const newLanguage = locales.value.find((l) => l.code === code)?.name;
  announceSuccess(t("messages.languageChanged", { language: newLanguage }));
}

function handleKeydown(event: KeyboardEvent, code: string) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    switchLanguage(code);
  }
}
</script>

<template>
  <div
    class="language-selector"
    role="region"
    :aria-label="t('accessibility.languageSelector')"
  >
    <!-- Bouton principal avec langue actuelle -->
    <button
      class="current-language btn-accessible"
      :aria-label="`${t('accessibility.currentLanguage')}: ${
        currentLocale?.name
      }`"
      aria-haspopup="true"
      :aria-expanded="false"
      type="button"
    >
      <span
        class="language-flag"
        :class="`flag-${locale}`"
        aria-hidden="true"
      ></span>
      <span class="language-name">{{ currentLocale?.name }}</span>
      <span class="language-code" aria-hidden="true">{{
        locale.toUpperCase()
      }}</span>
    </button>

    <!-- Liste des autres langues -->
    <div class="language-options" role="menu">
      <button
        v-for="availableLocale in availableLocales"
        :key="availableLocale.code"
        class="language-option btn-accessible"
        :aria-label="`${t('accessibility.switchTo')} ${availableLocale.name}`"
        role="menuitem"
        tabindex="0"
        @click="switchLanguage(availableLocale.code)"
        @keydown="handleKeydown($event, availableLocale.code)"
      >
        <span
          class="language-flag"
          :class="`flag-${availableLocale.code}`"
          aria-hidden="true"
        ></span>
        <span class="language-name">{{ availableLocale.name }}</span>
        <span class="language-code" aria-hidden="true">{{
          availableLocale.code.toUpperCase()
        }}</span>
      </button>
    </div>

    <!-- Texte caché pour les lecteurs d'écran -->
    <span class="sr-only" aria-live="polite" aria-atomic="true">
      {{ t("accessibility.currentLanguage") }}: {{ currentLocale?.name }}
    </span>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.current-language {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 44px;
}

.current-language:hover {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.05);
}

.current-language:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

.language-options {
  display: flex;
  gap: 4px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 36px;
}

.language-option:hover {
  border-color: #27ae60;
  background: #27ae60;
  color: white;
  transform: translateY(-1px);
}

.language-option:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 1px;
}

.language-option:active {
  transform: translateY(0);
}

.language-flag {
  width: 20px;
  height: 15px;
  border-radius: 2px;
  display: inline-block;
  background-size: cover;
  background-position: center;
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
  background-image: linear-gradient(90deg, #012169 100%),
    linear-gradient(135deg, #ffffff 25%, transparent 25%),
    linear-gradient(45deg, #ffffff 25%, transparent 25%),
    linear-gradient(-45deg, #ffffff 25%, transparent 25%),
    linear-gradient(-135deg, #ffffff 25%, transparent 25%);
}

.language-name {
  font-weight: 500;
}

.language-code {
  font-size: 11px;
  opacity: 0.7;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .language-selector {
    gap: 6px;
  }

  .current-language {
    padding: 6px 8px;
    font-size: 13px;
  }

  .language-option {
    padding: 4px 6px;
    font-size: 12px;
  }

  .language-name {
    display: none; /* Masquer les noms sur mobile, garder seulement les drapeaux */
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .current-language {
    border-color: #404040;
    color: #ffffff;
  }

  .current-language:hover {
    background: rgba(39, 174, 96, 0.2);
  }

  .language-option {
    border-color: #505050;
    color: #b3b3b3;
  }
}
</style>
