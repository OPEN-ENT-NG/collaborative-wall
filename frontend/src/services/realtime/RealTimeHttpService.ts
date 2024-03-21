import { RealTimeService } from "./RealTimeService";
import { EventPayload } from "./types";
const DELAY = 20000;
export class RealTimeHttpService extends RealTimeService {
  private interval?: number;
  constructor(resourceId: string, start = false) {
    super(resourceId);
    if (start) {
      this.start();
    }
  }
  override get ready() {
    // dont need to wait
    return Promise.resolve();
  }
  public override async send(payload: EventPayload) {
    await this.ready
    // TODO implement endpoints fallback that event push into websocket controller?
    await fetch("/collaborativewall/realtime/fallback", {
      body: JSON.stringify(payload),
      method: "PUT",
    });
  }
  public override doStart() {
    // start listener
    //TODO use reactquery?
    this.interval = setInterval(async () => {
      const [wall, notes] = await Promise.all([
        fetch(`/collaborativewall/${this.resourceId}`),
        fetch(`/collaborativewall/${this.resourceId}/notes`),
      ]);
      for (const sub of this.subscribers) {
        sub({
          type: "wallUpdate",
          wallId: (wall as any)._id,
          wall: wall as any,
        });
        for (const note of notes as any) {
          sub({
            type: "noteAdded",
            wallId: (wall as any)._id,
            note: note as any,
          });
        }
      }
    }, DELAY) as unknown as number;
    return this.ready;
  }
  public override doStop() {
    clearInterval(this.interval);
    this.interval = undefined;
    return Promise.resolve();
  }
}
