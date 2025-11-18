/** Configuration Nuxt - Food Delivery Platform */
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: "app/",
  css: ["~/assets/css/main.css"],

  devServer: {
    port: 3003,
  },

  modules: ["@pinia/nuxt", [
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
  ], "@nuxt/image"],

  build: {
    analyze: process.env.ANALYZE === "true",
  },

  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "format-detection", content: "telephone=no" },

        { name: "application-name", content: "FoodDelivery" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "FoodDelivery" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "msapplication-TileColor", content: "#27ae60" },
        { name: "msapplication-tap-highlight", content: "no" },
        { name: "theme-color", content: "#27ae60" },

        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "FoodDelivery" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@fooddelivery" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  runtimeConfig: {
    public: {
      PUBLIC_KEY: process.env.PUBLIC_KEY,
    },
    SECRET: process.env.SECRET,
  },
});