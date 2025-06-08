export class SocketManager {
  static instance: SocketManager;
  private clients = new Set<WebSocket>();

  constructor() {}
  async init() {
    return {
      open: this.open,
      message: this.message,
      close: this.close,
    };
  }

  private open(ws: WebSocket) {
    console.log("New client connected");
    this.clients.add(ws);
  }

  private message(ws: WebSocket, message: any) {
    console.log("Received message:", message);
  }

  private close(ws: WebSocket) {
    console.log("Client disconnected");
    this.clients.delete(ws);
  }
}
