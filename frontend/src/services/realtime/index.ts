import {
  CollaborativeWallNotePayload,
  CollaborativeWallPayload,
  EventPayload,
  MoveList,
  PickedNoteContent,
  PickedNoteImage,
  PickedNotePosition,
  Subscriber,
  Subscription,
} from "./types";
import { Defer, createDeferred } from "./utils";

export class RealTimeService {
  private socket?: WebSocket;
  private currentStatus: "started" | "stopped" = "stopped";
  private subscribers: Array<Subscriber> = [];
  private pendingStarts: Array<Defer<void>> = [];
  constructor(start = false) {
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
      if (this.currentStatus === "started") {
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
  get status() {
    return this.currentStatus;
  }
  get ready() {
    return Promise.all(this.pendingStarts.map((def) => def.promise));
  }
  private async send(payload: EventPayload) {
    await this.ready;
    this.socket?.send(JSON.stringify(payload));
  }
  start() {
    this.pendingStarts.push(createDeferred());
    if (window.location.hostname === "localhost") {
      this.socket = new WebSocket(`ws://${window.location}:9091`);
    } else {
      this.socket = new WebSocket(
        `ws://${window.location.host}/collaborativewall/realtime`,
      );
    }
    this.startListeners();
    this.currentStatus = "started";
  }
  stop() {
    this.socket?.close();
    this.socket = undefined;
    this.currentStatus = "stopped";
  }
  subscribe(callback: Subscriber): Subscription {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }
  queryForMetadata(wallId: string) {
    return this.send({
      wallId,
      type: "metadata",
    });
  }

  sendPing(wallId: string) {
    return this.send({
      wallId,
      type: "ping",
    });
  }

  sendWallUpdateEvent(wallId: string, wall: CollaborativeWallPayload) {
    return this.send({
      wallId,
      type: "wallUpdate",
      wall,
    });
  }

  sendWallDeletedEvent(wallId: string) {
    return this.send({
      wallId,
      type: "wallDeleted",
    });
  }

  sendNoteAddedEvent(wallId: string, note: CollaborativeWallNotePayload) {
    return this.send({
      wallId,
      type: "noteAdded",
      note: {
        ...note,
        idwall: wallId,
      },
    });
  }

  sendNoteCursorMovedEvent(wallId: string, noteId: string, move: MoveList) {
    return this.send({
      wallId,
      type: "cursorMove",
      noteId,
      move,
    });
  }

  sendNoteEditionStartedEvent(wallId: string, noteId: string) {
    return this.send({
      wallId,
      type: "noteEditionStarted",
      noteId,
    });
  }

  sendNoteEditionEndedEvent(wallId: string, noteId: string) {
    return this.send({
      wallId,
      type: "noteEditionEnded",
      noteId,
    });
  }

  sendNoteMovedEvent(wallId: string, noteId: string, note: PickedNotePosition) {
    return this.send({
      wallId,
      type: "noteMoved",
      noteId,
      note,
    });
  }

  sendNoteTextUpdatedEvent(wallId: string, note: PickedNoteContent) {
    return this.send({
      wallId,
      type: "noteTextUpdated",
      noteId: note._id,
      note,
    });
  }

  sendNoteImageUpdatedEvent(wallId: string, note: PickedNoteImage) {
    return this.send({
      wallId,
      type: "noteImageUpdated",
      noteId: note._id,
      note,
    });
  }

  sendNoteSeletedEvent(wallId: string, noteId: string, selected: boolean) {
    return this.send({
      wallId,
      type: selected ? "noteSelected" : "noteUnselected",
      noteId,
    });
  }

  sendNoteDeletedEvent(wallId: string, noteId: string) {
    return this.send({
      wallId,
      type: "noteDeleted",
      noteId,
    });
  }
}
