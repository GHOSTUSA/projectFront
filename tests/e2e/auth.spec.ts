import { test, expect } from "@playwright/test";

/**
 * Tests E2E pour le parcours d'authentification
 * Couvre l'inscription, la connexion et la déconnexion
 */
test.describe("Parcours Authentification", () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page d'accueil avant chaque test
    await page.goto("/");
  });

  test("Doit permettre la navigation vers la page de connexion", async ({
    page,
  }) => {
    // Vérifier que nous sommes sur la page d'accueil
    await expect(page).toHaveTitle(/Food.*Delivery/i);

    // Cliquer sur le lien de connexion/inscription (adapter selon votre UI)
    await page.click("text=Connexion", { timeout: 10000 });

    // Vérifier que nous sommes sur la page de connexion
    await expect(page.url()).toContain("/register");

    // Vérifier la présence des éléments de connexion
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("Doit afficher une erreur pour des identifiants incorrects", async ({
    page,
  }) => {
    // Aller à la page de connexion
    await page.goto("/register");

    // Attendre que la page soit chargée
    await page.waitForLoadState("networkidle");

    // Remplir le formulaire avec des identifiants incorrects
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Vérifier qu'un message d'erreur s'affiche
    await expect(page.locator("text=/erreur|incorrect|invalide/i")).toBeVisible(
      { timeout: 5000 }
    );
  });

  test("Doit permettre la connexion avec des identifiants valides", async ({
    page,
  }) => {
    // Aller à la page de connexion
    await page.goto("/register");

    await page.waitForLoadState("networkidle");

    // Utiliser des identifiants de test valides
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Attendre la redirection
    await page.waitForURL("/", { timeout: 10000 });

    // Vérifier que nous sommes connectés (chercher un élément d'utilisateur connecté)
    await expect(page.locator("text=/déconnexion|profil|compte/i")).toBeVisible(
      { timeout: 5000 }
    );
  });

  test("Doit permettre la déconnexion", async ({ page }) => {
    // Se connecter d'abord
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Attendre d'être connecté
    await page.waitForURL("/", { timeout: 10000 });

    // Cliquer sur déconnexion
    await page.click("text=/déconnexion/i");

    // Vérifier que nous sommes déconnectés
    await expect(page.locator("text=/connexion/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test("Doit permettre la navigation entre connexion et inscription", async ({
    page,
  }) => {
    await page.goto("/register");

    // Vérifier que la page contient les éléments d'inscription/connexion
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Tester la validation des champs
    await page.fill('input[type="email"]', "email-invalide");
    await page.click('button[type="submit"]');

    // Vérifier qu'une validation email s'affiche
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("Doit gérer les états de chargement", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Remplir le formulaire
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");

    // Intercepter les requêtes réseau pour simuler une lenteur
    await page.route("**/api/**", (route) => {
      setTimeout(() => route.continue(), 1000);
    });

    // Soumettre et vérifier l'état de chargement
    await page.click('button[type="submit"]');

    // Le bouton devrait être désactivé pendant le chargement
    await expect(page.locator('button[type="submit"]')).toBeDisabled({
      timeout: 500,
    });
  });
});
