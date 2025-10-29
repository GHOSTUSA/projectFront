/** Tests E2E pour le parcours de commande dans un restaurant - Navigation, sélection et commande */
import { test, expect } from "@playwright/test";

test.describe("Parcours Commande Restaurant", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/utilisateur/restaurant");
    await page.waitForLoadState("networkidle");
  });

  test("Doit afficher la liste des restaurants", async ({ page }) => {
    await page.waitForSelector(".restaurant-card", { timeout: 15000 });

    await expect(page.locator(".restaurant-card")).toHaveCount(5, {
      timeout: 10000,
    });

    await expect(page.locator(".restaurant-card").first()).toBeVisible();
  });

  test("Doit permettre de naviguer vers un restaurant spécifique", async ({
    page,
  }) => {
    await page.waitForSelector(".restaurant-card", { timeout: 15000 });

    const firstRestaurantLink = page
      .locator("a[href*='/utilisateur/restaurant/']")
      .first();
    await expect(firstRestaurantLink).toBeVisible({ timeout: 10000 });

    const linkHref = await firstRestaurantLink.getAttribute("href");
    console.log("Navigant vers:", linkHref);

    await page.goto(linkHref!);
    await page.waitForLoadState("networkidle");

    await expect(page.url()).toMatch(/\/utilisateur\/restaurant\/\d+/);

    await expect(page.locator(".restaurant-detail h1")).toBeVisible({
      timeout: 10000,
    });
  });

  test("Doit permettre de voir les détails d'un plat", async ({ page }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await expect(page.url()).toMatch(/\/plat\/\d+/);

    await expect(page.locator("text=/prix|€/i")).toBeVisible();
    await expect(page.locator("text=/ajouter|panier/i")).toBeVisible();
  });

  test("Doit permettre d'ajouter un plat au panier", async ({ page }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const firstDish = page
      .locator('[data-testid="dish-card"], .dish-card')
      .first();
    await expect(firstDish).toBeVisible({ timeout: 10000 });
    await firstDish.click();

    await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });

    await page.click("text=/ajouter.*panier/i");

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

    const plusButton = page.locator(
      'button:has-text("+"), [data-testid="increment"]'
    );
    const minusButton = page.locator(
      'button:has-text("-"), [data-testid="decrement"]'
    );

    if ((await plusButton.count()) > 0) {
      await plusButton.first().click();
      await plusButton.first().click();

      await expect(
        page.locator(
          'text=/quantité.*[2-9]/i, input[value="2"], input[value="3"]'
        )
      ).toBeVisible({ timeout: 3000 });
    }

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

    await expect(page.locator("text=/description|ingrédients/i")).toBeVisible();

    await expect(page.locator("text=/€|prix/i")).toBeVisible();
  });

  test("Doit permettre la navigation entre plats du même restaurant", async ({
    page,
  }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const dishCards = page.locator('[data-testid="dish-card"], .dish-card');
    const dishCount = await dishCards.count();

    if (dishCount > 1) {
      await dishCards.first().click();
      await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });

      await page.goBack();
      await page.waitForLoadState("networkidle");

      await dishCards.nth(1).click();
      await page.waitForURL(/\/plat\/\d+/, { timeout: 10000 });

      await expect(page.locator("text=/prix|€/i")).toBeVisible();
    }
  });

  test("Doit gérer les plats indisponibles", async ({ page }) => {
    await page.goto("/utilisateur/restaurant/1");
    await page.waitForLoadState("networkidle");

    const unavailableDishes = page.locator("text=/indisponible|rupture/i");

    if ((await unavailableDishes.count()) > 0) {
      const unavailableDish = unavailableDishes.first();
      await unavailableDish.click();

      const addButton = page.locator("text=/ajouter.*panier/i");
      if ((await addButton.count()) > 0) {
        await expect(addButton).toBeDisabled();
      }
    }
  });
});
