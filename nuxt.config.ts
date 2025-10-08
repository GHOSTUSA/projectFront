// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
    srcDir: "app/",
  css: ["~/assets/css/main.css"],
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    public: {
      PUBLIC_KEY: process.env.PUBLIC_KEY,
    },
    SECRET: process.env.SECRET,
  },
});
