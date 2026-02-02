import { ElysiaWS } from "elysia/dist/ws";
import { addSocket, removeSocket, sockToID, tokenToTogglData } from "./auth";
import createWebhook from "../integrations/toggl/createWebhook";
import { syncTogglData } from "../services/toggl/syncService";

export class SocketManager {

  

  private authListeners: ((ws: ElysiaWS) => void)[] = [];
  static instance: SocketManager;
  private static clients: Map<string, Set<ElysiaWS>>;
  private static socketToId: Map<string, string>;

  constructor() {
    SocketManager.clients = new Map<string, Set<ElysiaWS>>();
    SocketManager.socketToId = new Map<string, string>();
    SocketManager.instance = this;
  }

  async init() {
    return {
      open: this.open.bind(this),
      message: this.message.bind(this),
      close: this.close.bind(this),
    };
  }

  public open(ws: ElysiaWS) {}

  public async message(ws: ElysiaWS, message: any) {
    if (message.type === "auth") {
      const { token } = message.payload;
      const data = await tokenToTogglData(token);

      if (!data) {
        ws.close(401);
      } else {
        console.log("Authenticated " + data.togglUserId);
        createWebhook(-1, data.togglToken);
        addSocket(data.togglUserId, ws);
        
        // Initialize the client set if needed
        if (!SocketManager.clients.has(data.togglUserId)) {
          SocketManager.clients.set(data.togglUserId, new Set());
        }
        
        // Clean up any stale/closed sockets before adding the new one
        const clientSet = SocketManager.clients.get(data.togglUserId)!;
        for (const existingWs of clientSet) {
          if (existingWs.readyState === 2 || existingWs.readyState === 3) {
            // CLOSING or CLOSED - remove it
            clientSet.delete(existingWs);
            SocketManager.socketToId.delete(existingWs.id);
            removeSocket(existingWs); // Also clear auth mapping
          }
        }
        
        clientSet.add(ws);
        SocketManager.socketToId.set(ws.id, data.togglUserId);
        this.authListeners.forEach((x) => x(ws));
      }
      return;
    }

    if (message.type === "ping") {
      const id = await sockToID(ws);

      // Close stale connection, force socket to reconnect
      if (!id) {
        console.log("Closing stale connection with " + ws.id);
        ws.close(401);
        return;
      }

      // Only add socket if not already tracked
      if (!SocketManager.socketToId.has(ws.id)) {
        if (!SocketManager.clients.has(id)) {
          SocketManager.clients.set(id, new Set());
        }
        SocketManager.clients.get(id)!.add(ws);
        SocketManager.socketToId.set(ws.id, id);
      }
      ws.send(JSON.stringify({ type: "pong", payload: {} }));
      return;
    }
  }

  public close(ws: ElysiaWS) {
    const id = SocketManager.socketToId.get(ws.id);
    if (id == undefined) return;
    removeSocket(ws);
    const clientSet = SocketManager.clients.get(id);
    if (clientSet) {
      clientSet.delete(ws);
      if (clientSet.size === 0) {
        SocketManager.clients.delete(id);
      }
    }
    SocketManager.socketToId.delete(ws.id);
  }

  public send<T>(to: string, message: string, data: T) {
    const clientSet = SocketManager.clients.get(to);

    if (!clientSet || clientSet.size === 0) {
      console.warn("No sockets found for " + to);
      return;
    }

    // Diagnostic: log if there are many sockets for this user
    if (clientSet.size > 2) {
      console.warn(`User ${to} has ${clientSet.size} socket connections! This may indicate a leak.`);
    }

    clientSet.forEach((ws) => {
      if (ws.readyState == 3) {
        console.warn("Socket for " + to + " is closed. Removing...");
        clientSet.delete(ws);
        SocketManager.socketToId.delete(ws.id);
        removeSocket(ws); // Also clear auth mapping
        return;
      }
      ws.send(JSON.stringify({ type: message, payload: data }));
    });

    if (clientSet.size === 0) {
      SocketManager.clients.delete(to);
    }
  }

  public addAuthListener(callback: (ws: ElysiaWS) => void) {
    this.authListeners.push(callback);
  }
}
