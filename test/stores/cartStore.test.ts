import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCartStore } from "../../app/stores/panier/cardStore";
import type { Dish, CartItem } from "../../app/types/Dish";

describe("CartStore", () => {
  let cartStore: ReturnType<typeof useCartStore>;

  // Données de test
  const mockDish1: Dish = {
    id: 1,
    name: "Pizza Margherita",
    description: "Pizza classique avec tomate et mozzarella",
    price: 12.5,
    category: "Pizza",
    image: "/images/pizza-margherita.jpg",
    allergens: ["gluten", "lactose"],
    restaurantId: 1,
  };

  const mockDish2: Dish = {
    id: 2,
    name: "Burger Bacon",
    description: "Burger avec bacon grillé",
    price: 15.9,
    category: "Burger",
    image: "/images/burger-bacon.jpg",
    allergens: ["gluten"],
    restaurantId: 1,
  };

  const mockDish3: Dish = {
    id: 3,
    name: "Salade César",
    description: "Salade fraîche avec poulet",
    price: 9.8,
    category: "Salade",
    image: "/images/salade-cesar.jpg",
    allergens: [],
    restaurantId: 2, // Différent restaurant
  };

  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia());
    cartStore = useCartStore();
  });

  describe("État initial", () => {
    it("devrait avoir un état initial correct", () => {
      expect(cartStore.items).toEqual([]);
      expect(cartStore.loading).toBe(false);
      expect(cartStore.error).toBeNull();
    });
  });

  describe("Getters", () => {
    beforeEach(() => {
      // Ajouter quelques articles pour tester les getters
      cartStore.addToCart(mockDish1, 2);
      cartStore.addToCart(mockDish2, 1);
    });

    it("cartItemCount devrait retourner le nombre total d'articles", () => {
      expect(cartStore.cartItemCount).toBe(3); // 2 + 1
    });

    it("cartItems devrait retourner la liste des articles", () => {
      expect(cartStore.cartItems).toHaveLength(2);
      expect(cartStore.cartItems[0]?.name).toBe("Pizza Margherita");
      expect(cartStore.cartItems[1]?.name).toBe("Burger Bacon");
    });

    it("cartPrice devrait calculer le prix total correct", () => {
      // (12.50 * 2) + (15.90 * 1) = 25.00 + 15.90 = 40.90
      expect(cartStore.cartPrice).toBe(40.9);
    });

    it("isEmpty devrait retourner false quand il y a des articles", () => {
      expect(cartStore.isEmpty).toBe(false);
    });

    it("isEmpty devrait retourner true quand le panier est vide", () => {
      cartStore.clearCart();
      expect(cartStore.isEmpty).toBe(true);
    });

    it("getItemQuantity devrait retourner la quantité correcte", () => {
      expect(cartStore.getItemQuantity(1)).toBe(2);
      expect(cartStore.getItemQuantity(2)).toBe(1);
      expect(cartStore.getItemQuantity(999)).toBe(0); // Article inexistant
    });

    it("hasItem devrait vérifier la présence d'un article", () => {
      expect(cartStore.hasItem(1)).toBe(true);
      expect(cartStore.hasItem(2)).toBe(true);
      expect(cartStore.hasItem(999)).toBe(false);
    });

    it("uniqueItemsCount devrait retourner le nombre de types d'articles", () => {
      expect(cartStore.uniqueItemsCount).toBe(2);
    });
  });

  describe("Action addToCart", () => {
    it("devrait ajouter un nouvel article au panier", () => {
      cartStore.addToCart(mockDish1, 2);

      expect(cartStore.items).toHaveLength(1);
      expect(cartStore.items[0]?.id).toBe(1);
      expect(cartStore.items[0]?.quantity).toBe(2);
      expect(cartStore.items[0]?.totalPrice).toBe(25.0); // 12.50 * 2
    });

    it("devrait augmenter la quantité si l'article existe déjà", () => {
      cartStore.addToCart(mockDish1, 1);
      cartStore.addToCart(mockDish1, 2);

      expect(cartStore.items).toHaveLength(1);
      expect(cartStore.items[0]?.quantity).toBe(3);
      expect(cartStore.items[0]?.totalPrice).toBe(37.5); // 12.50 * 3
    });

    it("devrait ajouter avec quantité par défaut de 1", () => {
      cartStore.addToCart(mockDish1);

      expect(cartStore.items[0]?.quantity).toBe(1);
      expect(cartStore.items[0]?.totalPrice).toBe(12.5);
    });

    it("devrait effacer les erreurs lors de l'ajout", () => {
      cartStore.error = "Une erreur";
      cartStore.addToCart(mockDish1);

      expect(cartStore.error).toBeNull();
    });
  });

  describe("Action removeFromCart", () => {
    beforeEach(() => {
      cartStore.addToCart(mockDish1, 2);
      cartStore.addToCart(mockDish2, 1);
    });

    it("devrait retirer complètement un article du panier", () => {
      cartStore.removeFromCart(mockDish1);

      expect(cartStore.items).toHaveLength(1);
      expect(cartStore.items[0]?.id).toBe(2);
    });

    it("ne devrait rien faire si l'article n'existe pas", () => {
      const initialLength = cartStore.items.length;
      cartStore.removeFromCart(mockDish3);

      expect(cartStore.items).toHaveLength(initialLength);
    });

    it("devrait effacer les erreurs lors de la suppression", () => {
      cartStore.error = "Une erreur";
      cartStore.removeFromCart(mockDish1);

      expect(cartStore.error).toBeNull();
    });
  });

  describe("Action updateItemQuantity", () => {
    beforeEach(() => {
      cartStore.addToCart(mockDish1, 2);
    });

    it("devrait mettre à jour la quantité d'un article", () => {
      cartStore.updateItemQuantity(1, 5);

      expect(cartStore.items[0]?.quantity).toBe(5);
      expect(cartStore.items[0]?.totalPrice).toBe(62.5); // 12.50 * 5
    });

    it("devrait retirer l'article si la quantité est 0", () => {
      cartStore.updateItemQuantity(1, 0);

      expect(cartStore.items).toHaveLength(0);
    });

    it("devrait retirer l'article si la quantité est négative", () => {
      cartStore.updateItemQuantity(1, -1);

      expect(cartStore.items).toHaveLength(0);
    });

    it("ne devrait rien faire si l'article n'existe pas", () => {
      cartStore.updateItemQuantity(999, 5);

      expect(cartStore.items).toHaveLength(1); // Toujours le mockDish1
    });
  });

  describe("Actions incrementItem et decrementItem", () => {
    beforeEach(() => {
      cartStore.addToCart(mockDish1, 3);
    });

    it("incrementItem devrait augmenter la quantité de 1", () => {
      cartStore.incrementItem(1);

      expect(cartStore.items[0]?.quantity).toBe(4);
      expect(cartStore.items[0]?.totalPrice).toBe(50.0); // 12.50 * 4
    });

    it("decrementItem devrait diminuer la quantité de 1", () => {
      cartStore.decrementItem(1);

      expect(cartStore.items[0]?.quantity).toBe(2);
      expect(cartStore.items[0]?.totalPrice).toBe(25.0); // 12.50 * 2
    });

    it("decrementItem devrait retirer l'article si quantité devient 0", () => {
      cartStore.updateItemQuantity(1, 1); // Mettre quantité à 1
      cartStore.decrementItem(1);

      expect(cartStore.items).toHaveLength(0);
    });

    it("ne devrait rien faire sur un article inexistant", () => {
      cartStore.incrementItem(999);
      cartStore.decrementItem(999);

      expect(cartStore.items[0]?.quantity).toBe(3); // Inchangé
    });
  });

  describe("Action clearCart", () => {
    it("devrait vider complètement le panier", () => {
      cartStore.addToCart(mockDish1, 2);
      cartStore.addToCart(mockDish2, 1);
      cartStore.error = "Une erreur";

      cartStore.clearCart();

      expect(cartStore.items).toEqual([]);
      expect(cartStore.error).toBeNull();
    });
  });

  describe("Action clearError", () => {
    it("devrait effacer les erreurs", () => {
      cartStore.error = "Une erreur de test";

      cartStore.clearError();

      expect(cartStore.error).toBeNull();
    });
  });

  describe("Validation restaurant", () => {
    it("validateSameRestaurant devrait retourner true pour un panier vide", () => {
      expect(cartStore.validateSameRestaurant()).toBe(true);
    });

    it("validateSameRestaurant devrait retourner true pour le même restaurant", () => {
      cartStore.addToCart(mockDish1); // restaurant 1
      cartStore.addToCart(mockDish2); // restaurant 1

      expect(cartStore.validateSameRestaurant()).toBe(true);
    });

    it("validateSameRestaurant devrait retourner false pour différents restaurants", () => {
      cartStore.addToCart(mockDish1); // restaurant 1
      cartStore.addToCart(mockDish3); // restaurant 2

      expect(cartStore.validateSameRestaurant()).toBe(false);
    });

    it("getCartRestaurantId devrait retourner null pour un panier vide", () => {
      expect(cartStore.getCartRestaurantId()).toBeNull();
    });

    it("getCartRestaurantId devrait retourner l'ID du restaurant", () => {
      cartStore.addToCart(mockDish1); // restaurant 1

      expect(cartStore.getCartRestaurantId()).toBe(1);
    });
  });

  describe("Calculs de prix", () => {
    it("devrait gérer les calculs de prix avec décimales", () => {
      cartStore.addToCart(mockDish1, 3); // 12.50 * 3 = 37.50
      cartStore.addToCart(mockDish2, 2); // 15.90 * 2 = 31.80

      // Total: 37.50 + 31.80 = 69.30
      expect(cartStore.cartPrice).toBe(69.3);
    });

    it("devrait arrondir correctement les prix", () => {
      const dishWithDecimals: Dish = {
        ...mockDish1,
        price: 10.333, // Prix avec plus de 2 décimales
      };

      cartStore.addToCart(dishWithDecimals, 3);

      // 10.333 * 3 = 30.999, qui est arrondi par le store avec toFixed(2) -> 31.00
      expect(cartStore.items[0]?.totalPrice).toBe(31.0);
      expect(cartStore.cartPrice).toBe(31.0);
    });
  });
});
