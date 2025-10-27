/**
 * Interface représentant une commande dans le système
 * Gère le cycle de vie complet d'une commande depuis la création jusqu'à la livraison
 */
export interface Command {
  /** Identifiant unique de la commande */
  id: number;

  /** ID de l'utilisateur qui a passé la commande */
  userId: number;

  /** ID du restaurant concerné par la commande */
  restaurantId: number;

  /**
   * Statut actuel de la commande
   * - pending: Commande reçue, en attente de traitement
   * - in-progress: Commande en cours de préparation
   * - delivered: Commande livrée avec succès
   * - cancelled: Commande annulée
   */
  status: "pending" | "in-progress" | "delivered" | "cancelled";

  /** Date et heure de création de la commande (ISO string) */
  orderDate: string;

  /**
   * Date et heure de livraison prévue/effective
   * null si pas encore définie ou commande annulée
   */
  deliveryDate: string | null;

  /** Prix total de la commande en euros (avec 2 décimales) */
  totalPrice: number;

  /**
   * Liste détaillée des articles commandés
   * Chaque item contient l'ID du produit, la quantité et le prix unitaire
   */
  items: Array<{
    /** ID du plat commandé */
    productId: number;

    /** Quantité commandée de ce plat */
    quantity: number;

    /** Prix unitaire du plat au moment de la commande */
    unitPrice: number;
  }>;
}

/**
 * Type pour la création d'une nouvelle commande
 * Exclut les champs auto-générés (id, orderDate)
 */
export type CreateCommandData = Omit<Command, "id" | "orderDate"> & {
  /** Date de commande optionnelle (auto-générée si non fournie) */
  orderDate?: string;
};

/**
 * Type pour la mise à jour du statut d'une commande
 */
export interface UpdateCommandStatus {
  /** ID de la commande à mettre à jour */
  id: number;

  /** Nouveau statut */
  status: Command["status"];

  /** Date de livraison (si changement vers "delivered") */
  deliveryDate?: string;
}

/**
 * Type pour les statistiques de commandes
 */
export interface CommandStats {
  /** Nombre total de commandes */
  total: number;

  /** Répartition par statut */
  byStatus: Record<Command["status"], number>;

  /** Chiffre d'affaires total */
  totalRevenue: number;

  /** Commande moyenne */
  averageOrderValue: number;
}
