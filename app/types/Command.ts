export type Command = {
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
};
