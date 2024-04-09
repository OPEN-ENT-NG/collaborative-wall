import { RealTimeHttpService } from "./RealTimeHttpService";
import { RealTimeService } from "./RealTimeService";
import { RealTimeWSService } from "./RealTimeWSService";
import { EventPayload, Subscriber, Subscription } from "./types";

const RETRY_COUNTER = 5;

export class RealTimeProxyService extends RealTimeService {
  private mode: "http" | "ws" = "ws";
  private httpService: RealTimeHttpService;
  private wsService: RealTimeWSService;

  constructor(resourceId: string, start = false) {
    super(resourceId);

    this.httpService = new RealTimeHttpService(resourceId, false);
    this.wsService = new RealTimeWSService(resourceId, false);

    if (start) {
      this.start();
    }
  }
  override subscribe(callback: Subscriber): Subscription {
    if (this.mode === "http") {
      return this.httpService.subscribe(callback);
    } else {
      return this.wsService.subscribe(callback);
    }
  }

  getMode() {
    return this.mode;
  }

  override get ready() {
    if (this.mode === "http") {
      return this.httpService.ready;
    } else {
      return this.wsService.ready;
    }
  }
  protected override async send(payload: EventPayload) {
    await this.ready;
    if (this.mode === "http") {
      return this.httpService.send(payload);
    } else {
      return this.wsService.send(payload);
    }
  }
  protected override async doStart() {
    if (this.mode === "http") {
      this.mode = "http";
      return this.httpService.doStart();
    } else {
      // try start ws multiple times
      for (let i = 0; i < RETRY_COUNTER; i++) {
        try {
          await this.wsService.doStart();
          // start successfully
          this.mode = "ws";
          return;
        } catch (e) {
          // retry...
        }
      }
      // websocket has not started => http mode
      this.mode = "http";
      return this.httpService.doStart();
    }
  }
  protected override doStop() {
    if (this.mode === "http") {
      return this.httpService.doStop();
    } else {
      return this.wsService.doStop();
    }
  }
}
