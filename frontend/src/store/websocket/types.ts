import { NoteProps, PickedNoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";
// import { RealTimeProxyService } from "~/services/realtime/RealTimeProxyService";

export enum WebSocketMode {
  WS = "ws",
  HTTP = "http",
}

export enum WebsocketStatus {
  IDLE = "idle",
  STARTED = "started",
  STOPPED = "stopped",
}

export type WebsocketState = {
  ready: boolean;
  isOpened: boolean;
  mode: WebSocketMode;
  resourceId: string;
  subscribers: Array<Subscriber>;
  status: WebsocketStatus;
  openSocketModal: boolean;
};

export type WebsocketAction = {
  start: () => void;
  stop: () => void;
  doStart: () => void;
  doStop: () => void;
  startRealTime: (resourceId: string, start: boolean) => void;
  stopRealTime: () => void;
  subscribe(callback: Subscriber): Subscription;
  queryForMetadata: () => Promise<void>;
  send: (payload: ActionPayload) => Promise<void>;
  startListeners: () => void;
  sendPing: () => Promise<void>;
  sendWallDeletedEvent: () => Promise<void>;
  sendWallUpdateEvent: (wall: CollaborativeWallPayload) => Promise<void>;
  sendNoteAddedEvent: (note: PickedNoteProps) => Promise<void>;
  sendNoteCursorMovedEvent: (move: MoveList) => Promise<void>;
  sendNoteEditionEndedEvent: (noteId: string) => Promise<void>;
  sendNoteMovedEvent: (
    noteId: string,
    note: PickedNotePosition,
  ) => Promise<void>;
  sendNoteUpdated: (note: PickedNoteUpdate) => Promise<void>;
  sendNoteEditionStartedEvent: (noteId: string) => Promise<void>;
  // sendNoteImageUpdatedEvent: (note: PickedNoteImage) => Promise<void>;
  sendNoteSeletedEvent: (noteId: string, selected: boolean) => Promise<void>;
  sendNoteDeletedEvent: (noteId: string) => Promise<void>;
  setOpenSocketModal: (value: boolean) => void;
  listen: (cb: Subscriber) => Subscription;
};

export type CollaborativeWallPayload = Pick<
  CollaborativeWallProps,
  "_id" | "name" | "description" | "background" | "icon"
>;

export type CollaborativeWallNotePayload = Pick<
  NoteProps,
  "_id" | "content" | "owner" | "x" | "y" | "color" | "zIndex"
>;

export type MetadataPayload = {
  wallId: string;
  type: "metadata";
};

export type PingPayload = {
  wallId: string;
  type: "ping";
};

export type WallUpdatedPayload = {
  wallId: string;
  type: "wallUpdate";
  wall: CollaborativeWallPayload;
};

export type WallDeletedPayload = {
  wallId: string;
  type: "wallDeleted";
};

export type NoteAddedPayloadAction = {
  wallId: string;
  type: "noteAdded";
  note: PickedNoteProps & {
    idwall: string;
  };
};

export type MoveList = Array<{ x: number; y: number }>;

export type CursorMovedPayload = {
  wallId: string;
  type: "cursorMove";
  move: MoveList;
};
export type NoteEditionStartedPayload = {
  wallId: string;
  type: "noteEditionStarted";
  noteId: string;
};

export type NoteEditionFinishedPayload = {
  wallId: string;
  type: "noteEditionEnded";
  noteId: string;
};

export type PickedNotePosition = Pick<NoteProps, "_id" | "x" | "y">;

export type NoteMovedPayload = {
  wallId: string;
  type: "noteMoved";
  noteId: string;
  note: PickedNotePosition;
};

// TODO
export type PickedNoteUpdate = Pick<
  NoteProps,
  "_id" | "content" | "media" | "color"
>;

export type NoteUpdatedPayloadEvent = {
  wallId: string;
  type: "noteUpdated";
  noteId: string;
  oldNote: NoteProps;
  note: NoteProps;
};

export type NoteUpdatedPayloadAction = {
  wallId: string;
  type: "noteUpdated";
  noteId: string;
  note: PickedNoteUpdate;
};

// TODO fin

export type NoteSelectedPayload = {
  wallId: string;
  type: "noteSelected" | "noteUnselected";
  noteId: string;
};

export type NoteDeletedPayloadAction = {
  wallId: string;
  type: "noteDeleted";
  noteId: string;
};
export type NoteDeletedPayloadEvent = {
  wallId: string;
  type: "noteDeleted";
  noteId: string;
  note: NoteProps;
};

export type NoteAddedPayloadEvent = {
  wallId: string;
  type: "noteAdded";
  note: NoteProps & {
    idwall: string;
  };
};
export type EventPayload =
  | MetadataPayload
  | PingPayload
  | WallUpdatedPayload
  | WallDeletedPayload
  | NoteAddedPayloadEvent
  | CursorMovedPayload
  | NoteEditionStartedPayload
  | NoteEditionFinishedPayload
  | NoteMovedPayload
  | NoteUpdatedPayloadEvent
  | NoteSelectedPayload
  | NoteDeletedPayloadEvent;

export type ActionPayload =
  | MetadataPayload
  | PingPayload
  | WallUpdatedPayload
  | WallDeletedPayload
  | NoteAddedPayloadAction
  | CursorMovedPayload
  | NoteEditionStartedPayload
  | NoteEditionFinishedPayload
  | NoteMovedPayload
  | NoteUpdatedPayloadAction
  | NoteSelectedPayload
  | NoteDeletedPayloadAction;

export type Subscriber = (event: EventPayload) => void;
export type Subscription = () => void;
