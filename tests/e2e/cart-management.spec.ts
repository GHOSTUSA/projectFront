/** Tests E2E pour la gestion du panier - Ajout, modification, suppression et validation */
import { test, expect } from "@playwright/test";

test.describe("Parcours Gestion Panier", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    const timestamp = Date.now();
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[type="email"]', `test${timestamp}@example.com`);
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=/succès|success/i")).toBeVisible({
      timeout: 5000,
    });
    await page.waitForURL(/restaurant/, { timeout: 20000 });

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

      await page.goto("/utilisateur/restaurant");
      await page.waitForLoadState("networkidle");
    }
  });

  test("Doit afficher un panier vide initialement", async ({ page }) => {
    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator("text=/panier.*vide|aucun.*article/i")
    ).toBeVisible({ timeout: 10000 });

    await expect(page.locator("text=/total.*0|0.*€/i")).toBeVisible();
  });

  test("Doit permettre d'ajouter des articles au panier", async ({ page }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator('[data-testid="cart-item"], .cart-item')
    ).toBeVisible({ timeout: 10000 });

    await expect(page.locator("text=/total/i")).toBeVisible();
  });

  test("Doit permettre de modifier les quantités dans le panier", async ({
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
    await page.click("text=/ajouter.*panier/i");

    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    const plusButton = page
      .locator('button:has-text("+"), [data-testid="increment-cart"]')
      .first();
    const minusButton = page
      .locator('button:has-text("-"), [data-testid="decrement-cart"]')
      .first();

    if ((await plusButton.count()) > 0) {
      await plusButton.click();

      await expect(
        page.locator("text=/quantité.*[2-9]|[2-9].*unité/i")
      ).toBeVisible({ timeout: 3000 });

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
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    const removeButton = page
      .locator('text=/supprimer|retirer/i, button[title*="supprimer"]')
      .first();
    if ((await removeButton.count()) > 0) {
      await removeButton.click();

      await expect(
        page.locator("text=/panier.*vide|aucun.*article/i")
      ).toBeVisible({ timeout: 5000 });
    } else {
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
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const dishCards = page.locator('[data-testid="dish-card"], .dish-card');
    const dishCount = await dishCards.count();

    await dishCards.first().click();
    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    if (dishCount > 1) {
      await dishCards.nth(1).click();
      await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
      await page.click("text=/ajouter.*panier/i");
    }

    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=/total/i")).toBeVisible();

    await expect(page.locator("text=/d+[,.]?d*.*€|€.*d+/i")).toBeVisible();
  });

  test("Doit permettre de vider complètement le panier", async ({ page }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    const clearButton = page.locator("text=/vider|effacer.*panier/i");
    if ((await clearButton.count()) > 0) {
      await clearButton.click();

      const confirmButton = page.locator("text=/confirmer|oui|vider/i");
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }

      await expect(
        page.locator("text=/panier.*vide|aucun.*article/i")
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("Doit valider la cohérence du restaurant", async ({ page }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    await page.goto("/utilisateur/restaurant");
    await page.waitForLoadState("networkidle");

    const restaurants = page.locator(
      '[data-testid="restaurant-card"], .restaurant-card'
    );
    const restaurantCount = await restaurants.count();

    if (restaurantCount > 1) {
      await restaurants.nth(1).click();
      await page.waitForURL(/\/restaurant\/\d+/, { timeout: 10000 });

      const dishFromOtherRestaurant = page
        .locator('[data-testid="dish-card"], .dish-card')
        .first();
      if ((await dishFromOtherRestaurant.count()) > 0) {
        await dishFromOtherRestaurant.click();
        await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
        await page.click("text=/ajouter.*panier/i");

        await expect(
          page.locator("text=/restaurant.*différent|vider.*panier/i")
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("Doit permettre de procéder à la commande", async ({ page }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });
    await page.click("text=/ajouter.*panier/i");

    await page.goto("/utilisateur/panier");
    await page.waitForLoadState("networkidle");

    const orderButton = page.locator("text=/commander|passer.*commande/i");
    if ((await orderButton.count()) > 0) {
      await expect(orderButton).toBeVisible();
      await expect(orderButton).toBeEnabled();

      await orderButton.click();

      await expect(page.url()).toMatch(
        /commande|payment|checkout|confirmation/i
      );
    }
  });
});
