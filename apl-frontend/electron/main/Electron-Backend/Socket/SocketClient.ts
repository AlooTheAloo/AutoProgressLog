import WebSocket from "ws";
import { SERVER_URL } from "../api/ApiManager";
import { Logger } from "../../../../apl-backend/Helpers/Log";

export class SocketClient {
  static instance: SocketClient; // Singleton
  private socket?: WebSocket;
  private eventListeners: Partial<{
    [K in keyof EventMap]: (data: EventMap[K]) => void;
  }> = {};
  private authData?: { token: string }; // store last authData for reconnect
  private reconnectDelay = 3000; // ms
  private isReconnecting = false;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    SocketClient.instance = this;
  }

  async init(authData: { token: string }): Promise<void> {
    const URL = `ws://${SERVER_URL}/ws`;
    this.authData = authData; // store for reconnect

    return new Promise<void>((resolve, reject) => {
      Logger.log("Connecting to Socket with URL " + URL, "Socket");
      this.socket = new WebSocket(URL, {});

      this.socket.addEventListener("open", () => {
        Logger.log("Connected to WebSocket, sending auth", "Socket");
        this.socket?.send(
          JSON.stringify({
            type: "auth",
            payload: authData,
          }),
          (err) => {
            this.startHeartbeat();
          }
        );

        this.isReconnecting = false;
        resolve();
      });

      this.socket.addEventListener("error", (err) => {
        Logger.log("WebSocket error : " + (err as any).message, "Socket");
        reject(err);
      });

      this.socket.addEventListener("close", (event) => {
        Logger.log(`WebSocket closed: ${event.code} ${event.reason}`, "Socket");
        this.stopHeartbeat();
        if (!this.isReconnecting) {
          Logger.log("Reconnecting to socket", "Socket");
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
          if (type !== "pong") {
            Logger.log("Message! " + event.data, "Socket");
          }
        } catch (err) {
          Logger.log("Error parsing WebSocket message", "Socket");
        }
      });
    });
  }

  private reconnect() {
    if (!this.authData) {
      Logger.log("No auth data stored. Cannot reconnect.", "Socket");
      return;
    }

    this.isReconnecting = true;

    Logger.log(
      "Reconnecting to socket in " + this.reconnectDelay / 1000 + "s",
      "Socket"
    );
    setTimeout(() => {
      if (this.authData == undefined) return;
      Logger.log("Reconnecting to socket after delay", "Socket");
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
      Logger.log("WebSocket is not open. Cannot send message.", "Socket");
    }
  }

  public disconnect(): void {
    this.socket?.close();
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping", payload: {} }));
      }
    }, 5000);
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
  ClearActivity: {};
};
