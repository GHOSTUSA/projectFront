/**
 * Composable pour la gestion SEO dynamique
 * Génère automatiquement les métadonnées basées sur les données réelles
 */

import type { Restaurant } from "~/types/Restaurant";
import type { Dish } from "~/types/Dish";

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "restaurant" | "product" | "article";
}

/**
 * Génère les balises SEO dynamiques pour une liste de restaurants
 */
export function useRestaurantListSEO(restaurants: Restaurant[]) {
  const route = useRoute();
  const totalRestaurants = restaurants.length;

  // Statistiques pour SEO dynamique
  const cuisineTypes = [...new Set(restaurants.map((r) => r.cuisineType))];
  const avgRating =
    restaurants.length > 0
      ? (
          restaurants.reduce((sum, r) => sum + r.averageRating, 0) /
          restaurants.length
        ).toFixed(1)
      : "0";

  const topRatedCount = restaurants.filter(
    (r) => r.averageRating >= 4.5
  ).length;

  useSeoMeta({
    title: `${totalRestaurants} Restaurants de Qualité - Livraison Rapide | FoodDelivery`,
    ogTitle: `Découvrez ${totalRestaurants} restaurants partenaires`,
    description: `Commandez parmi ${totalRestaurants} restaurants de qualité • ${cuisineTypes.join(
      ", "
    )} • Note moyenne ${avgRating}/5 • ${topRatedCount} restaurants excellents • Livraison en 30min`,
    ogDescription: `${totalRestaurants} restaurants • ${cuisineTypes.length} types de cuisine • Livraison rapide • Paiement sécurisé`,
    keywords: [
      "restaurant",
      "livraison",
      "commande en ligne",
      "food delivery",
      ...cuisineTypes.map((c) => c.toLowerCase()),
      "delivery",
      "takeaway",
      "commander",
    ].join(", "),
    ogImage: "/images/restaurants-hero.jpg",
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: `${totalRestaurants} restaurants disponibles sur FoodDelivery`,
    twitterCard: "summary_large_image",
  });

  useHead({
    title: `${totalRestaurants} Restaurants - FoodDelivery`,
    link: [
      {
        rel: "canonical",
        href: `https://fooddelivery.com${route.path}`,
      },
      {
        rel: "alternate",
        hreflang: "fr",
        href: `https://fooddelivery.com/fr${route.path}`,
      },
      {
        rel: "alternate",
        hreflang: "en",
        href: `https://fooddelivery.com/en${route.path}`,
      },
    ],
    meta: [
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:site_name", content: "FoodDelivery" },
      { name: "author", content: "FoodDelivery Team" },
      { name: "publisher", content: "FoodDelivery" },
      { property: "og:updated_time", content: new Date().toISOString() },
    ],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${totalRestaurants} Restaurants disponibles`,
          description: `Découvrez notre sélection de ${totalRestaurants} restaurants partenaires`,
          url: `https://fooddelivery.com${route.path}`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: totalRestaurants,
            itemListElement: restaurants
              .slice(0, 20)
              .map((restaurant, index) => ({
                "@type": "Restaurant",
                position: index + 1,
                name: restaurant.name,
                image: restaurant.image,
                servesCuisine: restaurant.cuisineType,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: restaurant.address,
                },
                telephone: restaurant.phone,
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: restaurant.averageRating,
                  bestRating: "5",
                  worstRating: "1",
                },
                hasMenu: {
                  "@type": "Menu",
                  hasMenuSection: {
                    "@type": "MenuSection",
                    name: "Plats disponibles",
                    numberOfItems: restaurant.dishes?.length || 0,
                  },
                },
                url: `https://fooddelivery.com/utilisateur/restaurant/${restaurant.id}`,
              })),
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Accueil",
                item: "https://fooddelivery.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Restaurants",
                item: `https://fooddelivery.com${route.path}`,
              },
            ],
          },
          provider: {
            "@type": "Organization",
            name: "FoodDelivery",
            url: "https://fooddelivery.com",
            logo: "https://fooddelivery.com/logo.png",
          },
        }),
      },
    ],
  });
}

/**
 * Génère les balises SEO dynamiques pour un restaurant spécifique
 */
export function useRestaurantSEO(restaurant: Restaurant) {
  const route = useRoute();
  const dishCount = restaurant.dishes?.length || 0;
  const avgRating = restaurant.averageRating;

  // Catégories de plats disponibles
  const dishCategories = restaurant.dishes
    ? [...new Set(restaurant.dishes.map((d) => d.category))]
    : [];

  useSeoMeta({
    title: `${restaurant.name} - ${restaurant.cuisineType} • ${dishCount} plats • Note ${avgRating}/5`,
    ogTitle: `Commandez chez ${restaurant.name}`,
    description: `Découvrez ${restaurant.name}, restaurant ${restaurant.cuisineType} noté ${avgRating}/5 étoiles. ${dishCount} plats délicieux disponibles. Livraison rapide depuis ${restaurant.address}.`,
    ogDescription: `${restaurant.cuisineType} • ${avgRating}/5 ⭐ • ${dishCount} plats • Livraison rapide`,
    keywords: [
      restaurant.name,
      restaurant.cuisineType,
      "restaurant",
      "livraison",
      "commande",
      ...dishCategories,
      restaurant.address.split(",")[0], // Ville
    ].join(", "),
    ogImage: restaurant.image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: `${restaurant.name} - Restaurant ${restaurant.cuisineType}`,
    twitterCard: "summary_large_image",
  });

  useHead({
    title: `${restaurant.name} - ${restaurant.cuisineType} | FoodDelivery`,
    link: [
      {
        rel: "canonical",
        href: `https://fooddelivery.com${route.path}`,
      },
      {
        rel: "alternate",
        hreflang: "fr",
        href: `https://fooddelivery.com/fr${route.path}`,
      },
      {
        rel: "alternate",
        hreflang: "en",
        href: `https://fooddelivery.com/en${route.path}`,
      },
    ],
    meta: [
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "restaurant" },
      { property: "og:locale", content: "fr_FR" },
      { property: "place:location:latitude", content: "48.8566" }, // À remplacer par vraies coordonnées
      { property: "place:location:longitude", content: "2.3522" },
      { name: "geo.region", content: "FR" },
      { name: "geo.placename", content: restaurant.address.split(",")[0] },
    ],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: restaurant.name,
          image: [restaurant.image],
          address: {
            "@type": "PostalAddress",
            streetAddress: restaurant.address,
            addressCountry: "FR",
          },
          telephone: restaurant.phone,
          servesCuisine: restaurant.cuisineType,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: restaurant.averageRating,
            bestRating: "5",
            worstRating: "1",
          },
          hasMenu: {
            "@type": "Menu",
            hasMenuSection: dishCategories.map((category) => ({
              "@type": "MenuSection",
              name: category,
              hasMenuItem:
                restaurant.dishes
                  ?.filter((dish) => dish.category === category)
                  .slice(0, 10) // Limite pour éviter trop de données
                  .map((dish) => ({
                    "@type": "MenuItem",
                    name: dish.name,
                    description: dish.description,
                    image: dish.image,
                    offers: {
                      "@type": "Offer",
                      price: dish.price.toString(),
                      priceCurrency: "EUR",
                      availability: "https://schema.org/InStock",
                    },
                    nutrition: {
                      "@type": "NutritionInformation",
                      allergenInfo:
                        dish.allergens?.join(", ") || "Non spécifié",
                    },
                  })) || [],
            })),
          },
          url: `https://fooddelivery.com${route.path}`,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Accueil",
                item: "https://fooddelivery.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Restaurants",
                item: "https://fooddelivery.com/utilisateur/restaurant",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: restaurant.name,
                item: `https://fooddelivery.com${route.path}`,
              },
            ],
          },
        }),
      },
    ],
  });
}

/**
 * Génère les balises SEO dynamiques pour un plat spécifique
 */
export function useDishSEO(dish: Dish, restaurant: Restaurant) {
  const route = useRoute();

  useSeoMeta({
    title: `${dish.name} - ${dish.price}€ chez ${restaurant.name} | Commandez maintenant`,
    ogTitle: `${dish.name} chez ${restaurant.name}`,
    description: `${dish.description} • Prix: ${dish.price}€ • Restaurant: ${restaurant.name} (${restaurant.cuisineType}) • Note: ${restaurant.averageRating}/5 • Livraison rapide`,
    ogDescription: `${dish.name} • ${dish.price}€ • ${restaurant.cuisineType} • Livraison rapide`,
    keywords: [
      dish.name,
      dish.category,
      restaurant.name,
      restaurant.cuisineType,
      "plat",
      "commande",
      "livraison",
      ...(dish.allergens || []),
    ].join(", "),
    ogImage: dish.image,
    ogImageAlt: `${dish.name} - ${restaurant.name}`,
    twitterCard: "summary_large_image",
  });

  useHead({
    title: `${dish.name} - ${restaurant.name} | FoodDelivery`,
    link: [
      {
        rel: "canonical",
        href: `https://fooddelivery.com${route.path}`,
      },
    ],
    meta: [
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "product" },
      { property: "og:locale", content: "fr_FR" },
      { property: "product:price:amount", content: dish.price.toString() },
      { property: "product:price:currency", content: "EUR" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:category", content: dish.category },
    ],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: dish.name,
          description: dish.description,
          image: [dish.image],
          category: dish.category,
          offers: {
            "@type": "Offer",
            price: dish.price.toString(),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: `https://fooddelivery.com${route.path}`,
            seller: {
              "@type": "Restaurant",
              name: restaurant.name,
              address: restaurant.address,
              telephone: restaurant.phone,
            },
          },
          nutrition: {
            "@type": "NutritionInformation",
            allergenInfo: dish.allergens?.join(", ") || "Non spécifié",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: restaurant.averageRating,
            bestRating: "5",
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Accueil",
                item: "https://fooddelivery.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Restaurants",
                item: "https://fooddelivery.com/utilisateur/restaurant",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: restaurant.name,
                item: `https://fooddelivery.com/utilisateur/restaurant/${restaurant.id}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: dish.name,
                item: `https://fooddelivery.com${route.path}`,
              },
            ],
          },
        }),
      },
    ],
  });
}
