import { defineConfig, devices } from "@playwright/test";

/**
 * Configuration Playwright pour les tests E2E
 * Voir https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",

  /* Exécuter les tests en parallèle */
  fullyParallel: true,

  /* Reporter les échecs dans le CI */
  forbidOnly: !!process.env.CI,

  /* Réessayer en cas d'échec dans le CI */
  retries: process.env.CI ? 2 : 0,

  /* Nombre de workers en parallèle */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter à utiliser */
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  /* Configuration globale */
  use: {
    /* URL de base de l'application */
    baseURL: "http://localhost:3003",

    /* Collecter les traces en cas d'échec */
    trace: "on-first-retry",

    /* Prendre des screenshots en cas d'échec */
    screenshot: "only-on-failure",

    /* Enregistrer les vidéos en cas d'échec */
    video: "retain-on-failure",
  },

  /* Configuration des projets (navigateurs) */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test sur mobile */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Configuration du serveur de développement */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3003',
  //   reuseExistingServer: !process.env.CI,
  //   stdout: 'ignore',
  //   stderr: 'pipe',
  // },
});
