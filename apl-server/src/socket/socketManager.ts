import { ElysiaWS } from "elysia/dist/ws";
import {
  addSocket,
  togglTokenToTogglID,
  removeSocket,
  sockToID,
} from "./socketAuth";

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

      console.log("Auth attempt for " + id);

      if (!id) {
        ws.close(401);
      } else {
        console.log("Authenticated " + id);
        addSocket(id, ws);
        SocketManager.clients.set(id, ws);
        this.authListeners.forEach((x) => x(ws));
      }
      return;
    }

    if (message.type === "ping") {
      console.log("Ping !");
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
    if (SocketManager.clients.has(to)) {
      console.log("Snding message to " + to);
      SocketManager.clients.get(to)?.send({
        type: message,
        payload: data,
      });
    }
  }

  public addAuthListener(callback: (ws: ElysiaWS) => void) {
    this.authListeners.push(callback);
  }
}
