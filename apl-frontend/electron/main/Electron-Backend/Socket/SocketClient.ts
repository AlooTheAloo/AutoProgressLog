import WebSocket from "ws";
const URL = "wss://dev.chromaserver.net/ws";

export class SocketClient {
  static instance: SocketClient; // Singleton
  private socket?: WebSocket;
  private eventListeners: Partial<{
    [K in keyof EventMap]: (data: EventMap[K]) => void;
  }> = {};

  constructor() {
    SocketClient.instance = this;
  }

  async init(authData: { token: string }) {
    console.log("Initializing WebSocket client");

    return new Promise<void>((resolve, reject) => {
      this.socket = new WebSocket(URL);

      this.socket.addEventListener("open", () => {
        console.log("Connected to WebSocket, sending auth");

        this.socket?.send(
          JSON.stringify({
            type: "auth",
            payload: authData,
          }),
          (err) => {
            console.log("Sent auth" + err);
          }
        );

        resolve();
      });

      this.socket.addEventListener("error", (err) => {
        console.log("WebSocket error", err.message);
        reject(err);
      });

      this.socket.addEventListener("message", (event) => {
        try {
          const parsed = JSON.parse(event.data.toString());

          const { type, payload } = parsed;
          const listener = this.eventListeners[type as keyof EventMap];
          if (listener) {
            listener(payload);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message", err);
        }
      });
    });
  }

  public on<K extends keyof EventMap>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void {
    this.eventListeners[event] = callback as (data: any) => void;
  }

  public off<K extends keyof EventMap>(event: K): void {
    delete this.eventListeners[event];
  }

  public send<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: event,
          payload: data,
        })
      );
    } else {
      console.warn("WebSocket is not open. Cannot send message.");
    }
  }
}

type EventMap = {
  ActivityStart: { activity: string; start: number; id: string };
  ActivityStop: { id: string };
};
