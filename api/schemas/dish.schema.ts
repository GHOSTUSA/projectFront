import { Type, type Static } from "@sinclair/typebox";

export const DishBodySchema = Type.Object({
  name: Type.String(),
  description: Type.String(),
  price: Type.Number(),
  image: Type.String(),
});

export const UpdateDishBodySchema = Type.Partial(DishBodySchema);

export const CreateDishSchema = {
  body: DishBodySchema,
};

export const UpdateDishSchema = {
  params: Type.Object({
    id: Type.String(),
  }),
  body: UpdateDishBodySchema,
};

export type CreateDishRequest = Static<typeof DishBodySchema>;
export type UpdateDishRequest = Static<typeof UpdateDishBodySchema>;
