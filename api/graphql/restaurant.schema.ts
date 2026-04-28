export const restaurantSchema = `
  type Dish {
    id: ID!
    name: String!
    description: String!
    price: Float!
    image: String!
    restaurantId: String!
  }

  type OrderItem {
    id: ID!
    orderId: String!
    dishId: String!
    quantity: Int!
    price: Float!
  }

  type Order {
    id: ID!
    userId: String!
    restaurantId: String!
    status: String!
    totalPrice: Float!
    createdAt: String!
    updatedAt: String!
    items: [OrderItem!]!
  }

  type Restaurant {
    id: ID!
    name: String!
    rating: Float!
    address: String!
    phoneNumber: String!
    picture: String
    userId: String!
    dishes: [Dish!]!
    orders: [Order!]!
  }

  type Query {
    restaurants: [Restaurant!]!
    restaurant(id: ID!): Restaurant
  }
`;
