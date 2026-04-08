import type { AuthenticatedWebSocket } from "../types/socket.d.js";

// Map pour stocker les connexions WebSocket par restaurantId
const restaurantConnections = new Map<string, Set<AuthenticatedWebSocket>>();

export const registerRestaurantConnection = (
  restaurantId: string,
  socket: AuthenticatedWebSocket,
) => {
  if (!restaurantConnections.has(restaurantId)) {
    restaurantConnections.set(restaurantId, new Set());
  }
  restaurantConnections.get(restaurantId)!.add(socket);
};

export const unregisterRestaurantConnection = (
  restaurantId: string,
  socket: AuthenticatedWebSocket,
) => {
  const connections = restaurantConnections.get(restaurantId);
  if (connections) {
    connections.delete(socket);
    if (connections.size === 0) {
      restaurantConnections.delete(restaurantId);
    }
  }
};

export const notifyRestaurant = (
  restaurantId: string,
  event: string,
  data: any,
) => {
  const connections = restaurantConnections.get(restaurantId);
  if (connections) {
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });
    for (const client of connections) {
      try {
        if (client.socket.readyState === 1 /* OPEN */) {
          client.socket.send(message);
        }
      } catch (err) {
        console.error("Erreur lors de l'envoi du message WebSocket:", err);
      }
    }
  }
};
