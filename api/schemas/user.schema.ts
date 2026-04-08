import { Type, Static } from "@sinclair/typebox";

export const UserSchema = Type.Object({
  email: Type.String({ minLength: 2, format: "email" }),
  password: Type.String({ minLength: 6 }),
});

export type UserRequest = Static<typeof UserSchema>;

export const UpdateUserSchema = Type.Object(
  {
    email: Type.Optional(Type.String({ minLength: 2, format: "email" })),
    password: Type.Optional(Type.String({ minLength: 6 })),
  },
  { additionalProperties: false },
);

export type UpdateUserRequest = Static<typeof UpdateUserSchema>;
