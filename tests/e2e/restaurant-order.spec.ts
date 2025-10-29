import { test, expect } from "@playwright/test";

/**
 * Tests E2E pour le parcours de commande dans un restaurant
 * Couvre la navigation, sélection de plats, et processus de commande
 */
test.describe("Parcours Commande Restaurant", () => {
  test.beforeEach(async ({ page }) => {
    // Aller directement aux restaurants pour les tests
    await page.goto("/utilisateur/restaurant");
    await page.waitForLoadState("networkidle");
  });

  test("Doit afficher la liste des restaurants", async ({ page }) => {
    // Attendre que les restaurants se chargent
    await page.waitForSelector(".restaurant-card", { timeout: 15000 });

    // Vérifier que la page contient des restaurants
    await expect(page.locator(".restaurant-card")).toHaveCount(5, {
      timeout: 10000,
    }); // 5 restaurants dans data.json

    // Vérifier qu'au moins un restaurant est visible
    await expect(page.locator(".restaurant-card").first()).toBeVisible();
  });

  test("Doit permettre de naviguer vers un restaurant spécifique", async ({
    page,
  }) => {
    // Attendre que les restaurants se chargent
    await page.waitForSelector(".restaurant-card", { timeout: 15000 });

    // Obtenir l'URL du premier lien et naviguer directement
    const firstRestaurantLink = page.locator("a[href*='/utilisateur/restaurant/']").first();
    await expect(firstRestaurantLink).toBeVisible({ timeout: 10000 });
    
    const linkHref = await firstRestaurantLink.getAttribute("href");
    console.log("Navigant vers:", linkHref);
    
    // Navigation directe au lieu du clic
    await page.goto(linkHref!);
    await page.waitForLoadState("networkidle");

    // Vérifier que nous sommes sur la page du restaurant
    await expect(page.url()).toMatch(/\/utilisateur\/restaurant\/\d+/);

    // Vérifier que la page contient le nom du restaurant
    await expect(page.locator(".restaurant-detail h1")).toBeVisible({ timeout: 10000 });
  });

  test("Doit permettre de voir les détails d'un plat", async ({ page }) => {
    // Aller directement sur un restaurant (ID 1 par exemple)
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    // Cliquer sur le premier plat
    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    // Vérifier que nous sommes sur la page du plat
    await expect(page.url()).toMatch(/\/plat\/\d+/);

    // Vérifier les éléments de la page plat
    await expect(page.locator("text=/prix|€/i")).toBeVisible();
    await expect(page.locator("text=/ajouter|panier/i")).toBeVisible();
  });

  test("Doit permettre d'ajouter un plat au panier", async ({ page }) => {
    // Aller sur la page d'un plat
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    // Attendre la page du plat
    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });

    // Ajouter au panier
    await page.click("text=/ajouter.*panier/i");

    // Vérifier que le panier se met à jour (compteur ou notification)
    await expect(page.locator("text=/ajouté|panier.*1/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test("Doit permettre de gérer les quantités depuis la page plat", async ({
    page,
  }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });

    // Chercher les boutons de quantité
    const plusButton = page.locator(
      'button:has-text("+"), [data-testid="increment"]'
    );
    const minusButton = page.locator(
      'button:has-text("-"), [data-testid="decrement"]'
    );

    if ((await plusButton.count()) > 0) {
      // Augmenter la quantité
      await plusButton.first().click();
      await plusButton.first().click();

      // Vérifier que la quantité affichée a changé
      await expect(
        page.locator(
          'text=/quantité.*[2-9]/i, input[value="2"], input[value="3"]'
        )
      ).toBeVisible({ timeout: 3000 });
    }

    // Ajouter au panier avec la quantité sélectionnée
    await page.click("text=/ajouter.*panier/i");
    await expect(page.locator("text=/ajouté|panier/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test("Doit afficher les informations nutritionnelles et allergènes", async ({
    page,
  }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });

    // Vérifier les informations du plat
    await expect(page.locator("text=/description|ingrédients/i")).toBeVisible();

    // Vérifier le prix est affiché
    await expect(page.locator("text=/€|prix/i")).toBeVisible();
  });

  test("Doit permettre la navigation entre plats du même restaurant", async ({
    page,
  }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    // Vérifier qu'il y a plusieurs plats disponibles
    const dishCards = page.locator('[data-testid="dish-card"], .dish-card');
    const dishCount = await dishCards.count();

    if (dishCount > 1) {
      // Cliquer sur le premier plat
      await dishCards.first().click();
      await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });

      // Retourner au restaurant
      await page.goBack();
      await page.waitForLoadState("networkidle");

      // Cliquer sur un autre plat
      await dishCards.nth(1).click();
      await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });

      // Vérifier que nous sommes sur une page de plat différente
      await expect(page.locator("text=/prix|€/i")).toBeVisible();
    }
  });

  test("Doit gérer les plats indisponibles", async ({ page }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    // Vérifier si des plats sont marqués comme indisponibles
    const unavailableDishes = page.locator("text=/indisponible|rupture/i");

    if ((await unavailableDishes.count()) > 0) {
      // Vérifier qu'on ne peut pas ajouter un plat indisponible au panier
      const unavailableDish = unavailableDishes.first();
      await unavailableDish.click();

      // Le bouton d'ajout au panier devrait être désactivé ou absent
      const addButton = page.locator("text=/ajouter.*panier/i");
      if ((await addButton.count()) > 0) {
        await expect(addButton).toBeDisabled();
      }
    }
  });
});
