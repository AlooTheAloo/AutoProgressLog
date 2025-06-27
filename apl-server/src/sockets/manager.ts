import { ElysiaWS } from "elysia/dist/ws";
import { addSocket, togglTokenToTogglID, removeSocket, sockToID } from "./auth";
import createWebhook from "../integrations/toggl/createWebhook";

export class SocketManager {
  private authListeners: ((ws: ElysiaWS) => void)[] = [];
  static instance: SocketManager;
  private static clients: Map<string, ElysiaWS>;

  constructor() {
    SocketManager.clients = new Map<string, ElysiaWS>();
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
      const id = await togglTokenToTogglID(token);

      console.log("Auth attempt for ", "Socket");

      if (!id) {
        ws.close(401);
      } else {
        console.log("Authenticated " + id);
        createWebhook(-1, token); // TODO: move this to client when auth system is complete
        addSocket(id, ws);
        SocketManager.clients.set(id, ws);
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

      SocketManager.clients.set(id, ws);
      console.log("Ping from " + id);
      ws.send(JSON.stringify({ type: "pong", payload: {} }));
      return;
    }
  }

  public close(ws: ElysiaWS) {
    const id = sockToID(ws);
    if (id == undefined) return;
    removeSocket(ws);
    if (SocketManager.clients.has(id)) {
      SocketManager.clients.delete(id);
    }
  }

  public send<T>(to: string, message: string, data: T) {
    console.log("Attempting to send message to " + to);
    const ws = SocketManager.clients.get(to);
    console.log("The websocket is state " + ws?.readyState);

    if (!ws) {
      console.warn("No socket found for " + to);
      return;
    }

    if (ws.readyState == 3) {
      console.warn("Socket for " + to + " is closed. Removing...");
      SocketManager.clients.delete(to);
      return;
    }

    console.log("Sending message to " + to);
    ws.send(JSON.stringify({ type: message, payload: data }));
  }

  public addAuthListener(callback: (ws: ElysiaWS) => void) {
    this.authListeners.push(callback);
  }
}
