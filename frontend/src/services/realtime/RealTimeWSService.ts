import { RealTimeService } from "./RealTimeService";
import { EventPayload } from "./types";
import { Defer, createDeferred } from "./utils";

export class RealTimeWSService extends RealTimeService {
  private socket?: WebSocket;
  private pendingStarts: Array<Defer<void>> = [];
  constructor(resourceId: string, start = false) {
    super(resourceId);
    if (start) {
      this.start();
    }
  }
  private startListeners() {
    this.socket?.addEventListener("open", () => {
      this.pendingStarts.forEach((def) => def.resolve());
      // we can clean array for next awaiters
      this.pendingStarts = [];
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
        this.pendingStarts.forEach((def) => def.reject());
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
    return Promise.all(this.pendingStarts.map((def) => def.promise)).then(
      () => undefined,
    );
  }
  public override async send(payload: EventPayload) {
    await this.ready;
    this.socket?.send(JSON.stringify(payload));
  }
  public override doStart() {
    this.pendingStarts.push(createDeferred());
    if (window.location.hostname === "localhost") {
      this.socket = new WebSocket(`ws://${window.location}:9091`);
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
    return Promise.resolve();
  }
}
