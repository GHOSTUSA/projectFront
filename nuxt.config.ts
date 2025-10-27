// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: "app/",
  css: ["~/assets/css/main.css"],
  modules: [
    "@pinia/nuxt",
    // "@nuxt/image-edge",
    // "@vite-pwa/nuxt",
    [
      "@nuxtjs/i18n",
      {
        locales: [
          {
            code: "fr",
            iso: "fr-FR",
            name: "Français",
            file: "fr.json",
          },
          {
            code: "en",
            iso: "en-US",
            name: "English",
            file: "en.json",
          },
        ],
        lazy: true,
        langDir: "../i18n/locales/",
        defaultLocale: "fr",
        strategy: "prefix_except_default",
        detectBrowserLanguage: {
          useCookie: true,
          cookieKey: "i18n_redirected",
          redirectOn: "root",
          alwaysRedirect: false,
        },
        vueI18n: "./app/i18n.config.ts",
      },
    ],
  ],

  // Optimisation des performances et du bundle
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Séparer les vendors lourds
            "vue-vendor": ["vue", "vue-router"],
            "pinia-vendor": ["pinia", "@pinia/nuxt"],
            "i18n-vendor": ["@nuxtjs/i18n"],
          },
        },
      },
    },
  },

  // Configuration pour l'analyse du bundle
  build: {
    analyze: process.env.ANALYZE === "true",
  },

  // Configuration PWA et méta tags
  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "format-detection", content: "telephone=no" },

        // PWA Meta Tags
        { name: "application-name", content: "FoodDelivery" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "FoodDelivery" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "msapplication-TileColor", content: "#27ae60" },
        { name: "msapplication-tap-highlight", content: "no" },
        { name: "theme-color", content: "#27ae60" },

        // SEO et Open Graph
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "FoodDelivery" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@fooddelivery" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        // PWA links temporairement désactivés
        // { rel: "manifest", href: "/manifest.json" },
        // { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/icon-192x192.png" },
        // { rel: "mask-icon", href: "/icons/safari-pinned-tab.svg", color: "#27ae60" },
        // { rel: "msapplication-config", href: "/browserconfig.xml" }
      ],
    },
  },

  runtimeConfig: {
    public: {
      PUBLIC_KEY: process.env.PUBLIC_KEY,
    },
    SECRET: process.env.SECRET,
  },
});
