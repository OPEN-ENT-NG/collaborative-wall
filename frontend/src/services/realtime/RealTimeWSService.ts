import { RealTimeService } from "./RealTimeService";
import { EventPayload } from "./types";
import { Defer, createDeferred } from "./utils";

export class RealTimeWSService extends RealTimeService {
  private socket?: WebSocket;
  private pendingStart?: Defer<void>;
  constructor(resourceId: string, start = false) {
    super(resourceId);
    if (start) {
      this.start();
    }
  }
  private startListeners() {
    this.socket?.addEventListener("open", () => {
      this.pendingStart?.resolve();
    });
    this.socket?.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        this.subscribers.forEach((sub) => sub(data));
      } catch (error) {
        console.error(
          "[collaborativewall][realtime] Could not parse message:",
          error,
        );
      }
    });
    this.socket?.addEventListener("close", (event) => {
      if (!event.wasClean) {
        this.pendingStart?.reject(event.reason);
        console.warn(
          "[collaborativewall][realtime] Server closed connection unilaterally. restarting...",
          event,
        );
        this.start();
      }
    });
    this.socket?.addEventListener("error", (event) => {
      console.error(
        "[collaborativewall][realtime] Server has sent error:",
        event,
      );
    });
  }
  override get ready() {
    return this.pendingStart?.promise ?? Promise.reject("not.initialized");
  }
  public override async send(payload: EventPayload) {
    await this.ready;
    this.socket?.send(JSON.stringify(payload));
  }
  public override doStart() {
    if (this.pendingStart) {
      return this.ready;
    }
    this.pendingStart = createDeferred();
    if (window.location.hostname === "localhost") {
      this.socket = new WebSocket(`ws://${window.location.hostname}:9091`);
    } else {
      this.socket = new WebSocket(
        `ws://${window.location.host}/collaborativewall/realtime`,
      );
    }
    this.startListeners();
    return this.ready;
  }
  public override doStop() {
    this.socket?.close();
    this.socket = undefined;
    this.pendingStart = undefined;
    return Promise.resolve();
  }
}
