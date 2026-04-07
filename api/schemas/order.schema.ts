import { Type, type Static } from "@sinclair/typebox";
import { OrderStatus } from "../generated/prisma/client.js";

// L'énumération Prisma `OrderStatus` utilisée comme union TypeBox
const OrderStatusType = Type.Union([
  Type.Literal("PENDING"),
  Type.Literal("CONFIRMED"),
  Type.Literal("PREPARING"),
  Type.Literal("READY"),
  Type.Literal("DELIVERED"),
  Type.Literal("CANCELLED"),
]);

const OrderItemInputSchema = Type.Object({
  dishId: Type.String(),
  quantity: Type.Integer({ minimum: 1 }),
});

export const CreateOrderBodySchema = Type.Object({
  restaurantId: Type.String(),
  items: Type.Array(OrderItemInputSchema, { minItems: 1 }),
});

export const UpdateOrderStatusBodySchema = Type.Object({
  status: OrderStatusType,
});

export const CreateOrderSchema = {
  body: CreateOrderBodySchema,
};

export const UpdateOrderStatusSchema = {
  params: Type.Object({
    id: Type.String(),
  }),
  body: UpdateOrderStatusBodySchema,
};

export type CreateOrderRequest = Static<typeof CreateOrderBodySchema>;
export type UpdateOrderStatusRequest = Static<
  typeof UpdateOrderStatusBodySchema
>;
