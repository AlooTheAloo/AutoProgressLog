import WebSocket from "ws";

const URL = "ws://localhost:8080/ws";

export class SocketClient {
  static instance: SocketClient; // Singleton
  private socket?: WebSocket;
  private eventListeners: Partial<{
    [K in keyof EventMap]: (data: EventMap[K]) => void;
  }> = {};
  private authData?: { token: string }; // store last authData for reconnect
  private reconnectDelay = 3000; // ms
  private isReconnecting = false;
  private shouldReconnect = true;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    SocketClient.instance = this;
  }

  async init(authData: { token: string }): Promise<void> {
    console.log("Initializing WebSocket client");

    this.authData = authData; // store for reconnect

    return new Promise<void>((resolve, reject) => {
      this.socket = new WebSocket(URL, {});

      this.socket.addEventListener("open", () => {
        console.log("Connected to WebSocket, sending auth");

        this.socket?.send(
          JSON.stringify({
            type: "auth",
            payload: authData,
          }),
          (err) => {
            this.startHeartbeat();
            console.log("Sent auth", err);
          }
        );

        this.isReconnecting = false;
        resolve();
      });

      this.socket.addEventListener("error", (err) => {
        console.log("WebSocket error", (err as any).message);
        reject(err);
      });

      this.socket.addEventListener("close", (event) => {
        console.warn(`WebSocket closed: ${event.code} ${event.reason}`);
        this.stopHeartbeat();
        if (this.shouldReconnect && !this.isReconnecting) {
          this.reconnect();
        }
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

  private reconnect() {
    if (!this.authData) {
      console.warn("No auth data stored. Cannot reconnect.");
      return;
    }

    this.isReconnecting = true;

    console.log(`Reconnecting in ${this.reconnectDelay / 1000}s...`);
    setTimeout(() => {
      if (this.authData == undefined) return;
      console.log("Attempting to reconnect...");
      this.init(this.authData).catch((err) => {
        console.error("Reconnect failed", err);
        // Will retry again after delay
        this.reconnect();
      });
    }, this.reconnectDelay);
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

  public disconnect(): void {
    this.shouldReconnect = false;
    this.socket?.close();
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping", payload: {} }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }
}

type EventMap = {
  ActivityStart: { activity: string; start: string; id: string };
  ActivityStop: { id: string };
};
