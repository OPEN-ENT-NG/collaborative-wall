import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";

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
  editing: Array<{ userId: string; noteId: string; since: number }>;
  connectedUsers: Array<{ id: string; name: string }>;
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
  note: NoteProps & {
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
  | NoteDeletedPayloadEvent;

export type ActionPayload =
  | Pick<MetadataPayload, "type" | "wallId">
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
  | NoteDeletedPayloadAction;

export type Subscriber = (event: EventPayload) => void;
export type Subscription = () => void;
