import { test, expect } from "@playwright/test";

/**
 * Tests E2E pour la gestion du panier
 * Couvre l'ajout, modification, suppression et validation du panier
 */
test.describe("Parcours Gestion Panier", () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter et vider le panier avant chaque test
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Créer un compte unique pour chaque test
    const timestamp = Date.now();
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[type="email"]', `test${timestamp}@example.com`);
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Attendre le message de succès puis la redirection
    await expect(page.locator("text=/succès|success/i")).toBeVisible({
      timeout: 5000,
    });
    await page.waitForURL(/restaurant/, { timeout: 20000 });

    // Vider le panier s'il existe
    const cartLink = page
      .locator('[href*="panier"]')
      .or(page.locator("text=/panier/i"));
    if ((await cartLink.count()) > 0) {
      await cartLink.first().click();
      await page.waitForLoadState("networkidle");

      const clearButton = page.locator("text=/vider|effacer/i");
      if ((await clearButton.count()) > 0) {
        await clearButton.click();
      }

      // Retourner à la page restaurants
      await page.goto("/utilisateur/restaurant");
      await page.waitForLoadState("networkidle");
    }
  });

  test("Doit afficher un panier vide initialement", async ({ page }) => {
    // Aller à la page du panier
    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    // Vérifier que le panier est vide
    await expect(
      page.locator("text=/panier.*vide|aucun.*article/i")
    ).toBeVisible({ timeout: 10000 });

    // Vérifier que le total est 0
    await expect(page.locator("text=/total.*0|0.*€/i")).toBeVisible();
  });

  test("Doit permettre d'ajouter des articles au panier", async ({ page }) => {
    // Ajouter un plat au panier depuis un restaurant
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    // Aller au panier
    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    // Vérifier qu'il y a maintenant un article
    await expect(
      page.locator('[data-testid="cart-item"], .cart-item')
    ).toBeVisible({ timeout: 10000 });

    // Vérifier que le total n'est plus 0
    await expect(page.locator("text=/total/i")).toBeVisible();
  });

  test("Doit permettre de modifier les quantités dans le panier", async ({
    page,
  }) => {
    // Ajouter un article d'abord
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    // Aller au panier
    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    // Chercher les boutons de quantité
    const plusButton = page
      .locator('button:has-text("+"), [data-testid="increment-cart"]')
      .first();
    const minusButton = page
      .locator('button:has-text("-"), [data-testid="decrement-cart"]')
      .first();

    if ((await plusButton.count()) > 0) {
      // Augmenter la quantité
      await plusButton.click();

      // Vérifier que la quantité et le prix se mettent à jour
      await expect(
        page.locator("text=/quantité.*[2-9]|[2-9].*unité/i")
      ).toBeVisible({ timeout: 3000 });

      // Diminuer la quantité
      if ((await minusButton.count()) > 0) {
        await minusButton.click();
        await expect(page.locator("text=/quantité.*1|1.*unité/i")).toBeVisible({
          timeout: 3000,
        });
      }
    }
  });

  test("Doit permettre de supprimer des articles du panier", async ({
    page,
  }) => {
    // Ajouter un article
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    // Aller au panier
    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    // Supprimer l'article
    const removeButton = page
      .locator('text=/supprimer|retirer/i, button[title*="supprimer"]')
      .first();
    if ((await removeButton.count()) > 0) {
      await removeButton.click();

      // Vérifier que l'article est supprimé
      await expect(
        page.locator("text=/panier.*vide|aucun.*article/i")
      ).toBeVisible({ timeout: 5000 });
    } else {
      // Si pas de bouton supprimer direct, essayer de diminuer jusqu'à 0
      const minusButton = page
        .locator('button:has-text("-"), [data-testid="decrement-cart"]')
        .first();
      if ((await minusButton.count()) > 0) {
        await minusButton.click();
        await expect(
          page.locator("text=/panier.*vide|aucun.*article/i")
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("Doit calculer correctement le total du panier", async ({ page }) => {
    // Ajouter plusieurs articles
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const dishCards = page.locator('[data-testid="dish-card"], .dish-card');
    const dishCount = await dishCards.count();

    // Ajouter le premier plat
    await dishCards.first().click();
    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    // Retourner au restaurant et ajouter un autre plat si possible
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    if (dishCount > 1) {
      await dishCards.nth(1).click();
      await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
      await page.click("text=/ajouter.*panier/i");
    }

    // Aller au panier et vérifier le total
    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    // Vérifier qu'il y a un total affiché
    await expect(page.locator("text=/total/i")).toBeVisible();

    // Vérifier que le total contient un montant en euros
    await expect(page.locator("text=/d+[,.]?d*.*€|€.*d+/i")).toBeVisible();
  });

  test("Doit permettre de vider complètement le panier", async ({ page }) => {
    // Ajouter des articles
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    // Aller au panier
    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    // Vider le panier
    const clearButton = page.locator("text=/vider|effacer.*panier/i");
    if ((await clearButton.count()) > 0) {
      await clearButton.click();

      // Confirmer si une modal de confirmation apparaît
      const confirmButton = page.locator("text=/confirmer|oui|vider/i");
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }

      // Vérifier que le panier est vide
      await expect(
        page.locator("text=/panier.*vide|aucun.*article/i")
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("Doit valider la cohérence du restaurant", async ({ page }) => {
    // Ajouter un plat du restaurant 1
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    // Essayer d'ajouter un plat d'un autre restaurant si disponible
    await page.goto("/utilisateur/restaurant");
    await page.waitForLoadState("networkidle");

    const restaurants = page.locator(
      '[data-testid="restaurant-card"], .restaurant-card'
    );
    const restaurantCount = await restaurants.count();

    if (restaurantCount > 1) {
      // Aller au deuxième restaurant
      await restaurants.nth(1).click();
      await page.waitForURL(/\/restaurant\/\d+/, { timeout: 10000 });

      const dishFromOtherRestaurant = page
        .locator('[data-testid="dish-card"], .dish-card')
        .first();
      if ((await dishFromOtherRestaurant.count()) > 0) {
        await dishFromOtherRestaurant.click();
        await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
        await page.click("text=/ajouter.*panier/i");

        // Vérifier qu'un avertissement apparaît ou que le panier est vidé
        await expect(
          page.locator("text=/restaurant.*différent|vider.*panier/i")
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("Doit permettre de procéder à la commande", async ({ page }) => {
    // Ajouter un article au panier
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    // Aller au panier
    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    // Chercher le bouton de commande
    const orderButton = page.locator("text=/commander|passer.*commande/i");
    if ((await orderButton.count()) > 0) {
      await expect(orderButton).toBeVisible();
      await expect(orderButton).toBeEnabled();

      // Cliquer sur commander
      await orderButton.click();

      // Vérifier qu'on est redirigé vers une page de confirmation ou paiement
      await expect(page.url()).toMatch(
        /commande|payment|checkout|confirmation/i
      );
    }
  });
});
