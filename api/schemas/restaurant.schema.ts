import { Type, Static } from "@sinclair/typebox";

export const CreateRestaurantSchema = Type.Object(
  {
    name: Type.String({ minLength: 2 }),
    address: Type.String({ minLength: 5 }),
    phoneNumber: Type.String({ minLength: 5 }),
    picture: Type.Optional(Type.String({ format: "uri" })),
  },
  { additionalProperties: false },
);

export const UpdateRestaurantSchema = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 2 })),
    picture: Type.Optional(Type.String({ format: "uri" })),
  },
  { additionalProperties: false },
);

export const RestaurantResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  address: Type.String(),
  phoneNumber: Type.String(),
  picture: Type.Union([Type.String(), Type.Null()]),
  rating: Type.Number(),
});

export type CreateRestaurantRequest = Static<typeof CreateRestaurantSchema>;
export type UpdateRestaurantRequest = Static<typeof UpdateRestaurantSchema>;

export const RestaurantSchema = Type.Object(
  {
    name: Type.String({ minLength: 2, maxLength: 100 }),
    description: Type.String({ minLength: 2, maxLength: 255 }),
    address: Type.String({ minLength: 2, maxLength: 255 }),
    picture: Type.String({ minLength: 3, maxLength: 255 }),
    // rating: Type.Number({ minimum: 0, maximum: 5 }),
    phoneNumber: Type.String({ minLength: 2, maxLength: 20 }),
  },
  { additionalProperties: false },
);

export type RestaurantRequest = Static<typeof RestaurantSchema>;
