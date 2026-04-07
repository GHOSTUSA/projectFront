/** Types TypeScript - Commande et cycle de vie */
export interface Command {
  id: number;
  userId: number;
  restaurantId: number;
  status: "pending" | "in-progress" | "delivered" | "cancelled";
  orderDate: string;
  deliveryDate: string | null;
  totalPrice: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;
}

export type CreateCommandData = Omit<Command, "id" | "orderDate"> & {
  orderDate?: string;
};

export interface UpdateCommandStatus {
  id: number;
  status: Command["status"];
  deliveryDate?: string;
}

export interface CommandStats {
  total: number;
  byStatus: Record<Command["status"], number>;
  totalRevenue: number;
  averageOrderValue: number;
}
