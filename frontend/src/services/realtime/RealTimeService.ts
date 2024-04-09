import {
  ActionPayload,
  CollaborativeWallNotePayload,
  CollaborativeWallPayload,
  MoveList,
  PickedNoteContent,
  PickedNoteImage,
  PickedNotePosition,
  Subscriber,
  Subscription,
} from "./types";

export abstract class RealTimeService {
  protected subscribers: Array<Subscriber> = [];
  status: "started" | "stopped" | "idle" = "idle";
  constructor(protected resourceId: string) {}
  //
  // ABSTRACT
  //
  abstract readonly ready: Promise<void>;
  protected abstract doStart(): Promise<void>;
  protected abstract doStop(): Promise<void>;
  protected abstract send(payload: ActionPayload): Promise<void>;
  //
  // IMPLEMENTATION
  //
  start(): Promise<void> {
    const promise = this.doStart();
    this.status = "started";
    return promise;
  }
  stop() {
    const promise = this.doStop();
    this.status = "stopped";
    return promise;
  }
  subscribe(callback: Subscriber): Subscription {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }
  queryForMetadata() {
    return this.send({
      wallId: this.resourceId,
      type: "metadata",
    });
  }

  sendPing() {
    return this.send({
      wallId: this.resourceId,
      type: "ping",
    });
  }

  sendWallUpdateEvent(wall: CollaborativeWallPayload) {
    return this.send({
      wallId: this.resourceId,
      type: "wallUpdate",
      wall,
    });
  }

  sendWallDeletedEvent() {
    return this.send({
      wallId: this.resourceId,
      type: "wallDeleted",
    });
  }

  sendNoteAddedEvent(note: CollaborativeWallNotePayload) {
    return this.send({
      wallId: this.resourceId,
      type: "noteAdded",
      note: {
        ...note,
        idwall: this.resourceId,
        media: null,
      },
    });
  }

  sendNoteCursorMovedEvent(move: MoveList) {
    return this.send({
      wallId: this.resourceId,
      type: "cursorMove",
      move,
    });
  }

  sendNoteEditionStartedEvent(noteId: string) {
    return this.send({
      wallId: this.resourceId,
      type: "noteEditionStarted",
      noteId,
    });
  }

  sendNoteEditionEndedEvent(noteId: string) {
    return this.send({
      wallId: this.resourceId,
      type: "noteEditionEnded",
      noteId,
    });
  }

  sendNoteMovedEvent(noteId: string, note: PickedNotePosition) {
    return this.send({
      wallId: this.resourceId,
      type: "noteMoved",
      noteId,
      note,
    });
  }

  sendNoteTextUpdatedEvent(note: PickedNoteContent) {
    return this.send({
      wallId: this.resourceId,
      type: "noteTextUpdated",
      noteId: note._id,
      note,
    });
  }

  sendNoteImageUpdatedEvent(note: PickedNoteImage) {
    return this.send({
      wallId: this.resourceId,
      type: "noteImageUpdated",
      noteId: note._id,
      note,
    });
  }

  sendNoteSeletedEvent(noteId: string, selected: boolean) {
    return this.send({
      wallId: this.resourceId,
      type: selected ? "noteSelected" : "noteUnselected",
      noteId,
    });
  }

  sendNoteDeletedEvent(noteId: string) {
    return this.send({
      wallId: this.resourceId,
      type: "noteDeleted",
      noteId,
    });
  }
}
