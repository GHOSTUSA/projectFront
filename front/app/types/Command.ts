/** Types TypeScript - Commande et cycle de vie */
export type EntityId = string | number;

export interface Command {
  id: EntityId;
  userId: EntityId;
  restaurantId: EntityId;
  status: "pending" | "in-progress" | "delivered" | "cancelled";
  orderDate: string;
  deliveryDate: string | null;
  totalPrice: number;
  items: Array<{
    productId: EntityId;
    quantity: number;
    unitPrice: number;
  }>;
}

export type CreateCommandData = Omit<Command, "id" | "orderDate"> & {
  orderDate?: string;
};

export interface UpdateCommandStatus {
  id: EntityId;
  status: Command["status"];
  deliveryDate?: string;
}

export interface CommandStats {
  total: number;
  byStatus: Record<Command["status"], number>;
  totalRevenue: number;
  averageOrderValue: number;
}
