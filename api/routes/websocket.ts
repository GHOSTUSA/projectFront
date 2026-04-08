import { FastifyInstance, FastifyRequest } from "fastify";
import {
  registerRestaurantConnection,
  unregisterRestaurantConnection,
} from "../services/websocket.service.js";
import { Role } from "../generated/prisma/client.js";
import { WebSocket } from "@fastify/websocket";
import type { AuthenticatedWebSocket } from "../types/socket.d.js";

enum WebSocketEvent {
  AUTH = "authenticate",
  PING = "ping",
  PONG = "pong",
  CONNECTED = "connected",
}

interface AuthMessage {
  event: typeof WebSocketEvent.AUTH;
  token: string;
}

interface PingMessage {
  event: typeof WebSocketEvent.PING;
}

type WebSocketMessage = AuthMessage | PingMessage;

export interface AuthenticatedSocket {
  user: any;
  restaurantId: string;
  socket: WebSocket;
}

export const websocketRoutes = async (app: FastifyInstance) => {
  app.get(
    "/ws/restaurant",
    { websocket: true },
    async (socket: WebSocket, request: FastifyRequest) => {
      let authSocket: AuthenticatedWebSocket | null = null;
      let isAuthenticated = false;

      socket.on("message", async (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());

          if (!isAuthenticated) {
            if (message.event === WebSocketEvent.AUTH && "token" in message) {
              try {
                const decodedText: any = app.jwt.verify(message.token);

                const user = await app.prisma.user.findUnique({
                  where: { id: decodedText.id },
                });

                if (!user || user.role !== Role.RESTAURANT) {
                  socket.close(1008, "Non autorisé");
                  return;
                }

                const restaurant = await app.prisma.restaurant.findUnique({
                  where: { userId: user.id },
                });

                if (!restaurant) {
                  socket.close(1008, "Restaurant non trouvé");
                  return;
                }

                authSocket = {
                  user,
                  restaurantId: restaurant.id,
                  socket,
                };

                isAuthenticated = true;
                registerRestaurantConnection(restaurant.id, authSocket);

                socket.send(
                  JSON.stringify({
                    event: WebSocketEvent.CONNECTED,
                    data: {
                      restaurantId: restaurant.id,
                      message: "Authentification réussie",
                    },
                    timestamp: new Date().toISOString(),
                  }),
                );
              } catch (jwtErr) {
                socket.close(1008, "Token invalide");
              }
            } else {
              socket.close(1008, "Authentification requise");
            }
            return;
          }

          // Gérer les autres messages (quand authentifié)
          switch (message.event) {
            case WebSocketEvent.PING:
              socket.send(
                JSON.stringify({
                  event: WebSocketEvent.PONG,
                  timestamp: new Date().toISOString(),
                }),
              );
              break;
            default:
              // Ignorer les messages inconnus
              break;
          }
        } catch (err) {
          console.error("Erreur de parsing de message WebSocket:", err);
          if (!isAuthenticated) {
            socket.close(1011, "Erreur serveur");
          }
        }
      });

      socket.on("close", () => {
        if (authSocket && authSocket.restaurantId) {
          unregisterRestaurantConnection(authSocket.restaurantId, authSocket);
        }
      });

      socket.on("error", (error: Error) => {
        console.error("Erreur WebSocket:", error);
        if (authSocket && authSocket.restaurantId) {
          unregisterRestaurantConnection(authSocket.restaurantId, authSocket);
        }
        socket.close(1011, "Erreur serveur");
      });
    },
  );
};
