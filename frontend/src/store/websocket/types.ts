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
  send: (payload: EventPayload) => Promise<void>;
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
  sendNoteTextUpdatedEvent: (note: PickedNoteContent) => Promise<void>;
  sendNoteEditionStartedEvent: (noteId: string) => Promise<void>;
  sendNoteImageUpdatedEvent: (note: PickedNoteImage) => Promise<void>;
  sendNoteSeletedEvent: (noteId: string, selected: boolean) => Promise<void>;
  sendNoteDeletedEvent: (noteId: string) => Promise<void>;
  setOpenSocketModal: (value: boolean) => void;
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

export type NoteAddedPayload = {
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

export type PickedNoteContent = Pick<NoteProps, "_id" | "content">;

export type NoteTextUpdatedPayload = {
  wallId: string;
  type: "noteTextUpdated";
  noteId: string;
  note: PickedNoteContent;
};

export type PickedNoteImage = Pick<NoteProps, "_id" | "media">;

export type NoteImageUpdatedPayload = {
  wallId: string;
  type: "noteImageUpdated";
  noteId: string;
  note: PickedNoteImage;
};

export type NoteSelectedPayload = {
  wallId: string;
  type: "noteSelected" | "noteUnselected";
  noteId: string;
};

export type NoteDeletedPayload = {
  wallId: string;
  type: "noteDeleted";
  noteId: string;
};

export type EventPayload =
  | MetadataPayload
  | PingPayload
  | WallUpdatedPayload
  | WallDeletedPayload
  | NoteAddedPayload
  | CursorMovedPayload
  | NoteEditionStartedPayload
  | NoteEditionFinishedPayload
  | NoteMovedPayload
  | NoteTextUpdatedPayload
  | NoteImageUpdatedPayload
  | NoteSelectedPayload
  | NoteDeletedPayload;

export type Subscriber = (event: EventPayload) => void;
export type Subscription = () => void;
