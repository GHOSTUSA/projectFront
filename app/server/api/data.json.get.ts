import { readFileSync } from "fs";
import { join } from "path";

export default defineEventHandler(async (event) => {
  try {
    // Lire le fichier data.json depuis le dossier public
    const filePath = join(process.cwd(), "public", "api", "data.json");
    console.log("API: Tentative de lecture du fichier:", filePath);
    
    const data = readFileSync(filePath, "utf-8");
    console.log("API: Fichier lu avec succès, taille:", data.length);

    // Parse et retourne les données JSON
    const jsonData = JSON.parse(data);
    console.log("API: Données parsées, restaurants trouvés:", jsonData.restaurants?.length || 0);

    // Ajouter les headers appropriés
    setHeader(event, "Content-Type", "application/json");
    setHeader(event, "Cache-Control", "public, max-age=3600"); // Cache 1h

    return jsonData;
  } catch (error) {
    console.error("API: Erreur lors de la lecture de data.json:", error);

    // Retourner des données par défaut en cas d'erreur
    return {
      users: [],
      restaurants: [
        {
          id: 1,
          name: "Restaurant Test",
          address: "123 Test Street",
          phone: "01 23 45 67 89",
          cuisineType: "Test",
          averageRating: 4.0,
          image:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          dishes: [
            {
              id: 1,
              name: "Plat Test",
              description: "Un plat de test",
              price: 15.0,
              category: "Main Course",
              image:
                "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              allergens: [],
            },
          ],
        },
      ],
      commands: [],
    };
  }
});
