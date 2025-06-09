import { ElysiaWS } from "elysia/dist/ws";
import { addSocket, auth, removeSocket, sockToID } from "./socketAuth";

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
    console.log(ws);

    if (message.type === "auth") {
      const { token } = message.payload;
      const id = await auth(token);

      if (!id) {
        ws.close(401);
      } else {
        addSocket(id, ws);
        SocketManager.clients.set(id, ws);
        this.authListeners.forEach((x) => x(ws));
      }
      return;
    }
  }

  public close(ws: ElysiaWS) {
    console.log("Client left");
    const id = sockToID(ws);
    console.log(id);
    if (id == undefined) return;
    removeSocket(ws);
    if (SocketManager.clients.has(id)) {
      SocketManager.clients.delete(id);
      console.log(SocketManager.clients);
    }
  }

  public send<T>(to: string, message: string, data: T) {
    if (SocketManager.clients.has(to)) {
      SocketManager.clients.get(to)?.send({
        type: message,
        paylioad: data,
      });
    }
  }

  public addAuthListener(callback: (ws: ElysiaWS) => void) {
    this.authListeners.push(callback);
  }
}
