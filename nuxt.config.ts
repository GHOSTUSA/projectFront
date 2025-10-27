// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: "app/",
  css: ["~/assets/css/main.css"],
  modules: [
    "@pinia/nuxt",
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

  runtimeConfig: {
    public: {
      PUBLIC_KEY: process.env.PUBLIC_KEY,
    },
    SECRET: process.env.SECRET,
  },
});
