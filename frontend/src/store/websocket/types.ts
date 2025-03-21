import { NoteProps, PickedNoteProps } from '~/models/notes';
import { MoveUser } from '~/models/types';
import { CollaborativeWallProps } from '~/models/wall';

export enum Mode {
  WS = 'ws',
  HTTP = 'http',
}

export enum Status {
  IDLE = 'idle',
  STARTED = 'started',
  STOPPED = 'stopped',
}
export type HttpProvider = {
  refetch: () => Promise<{
    wall: CollaborativeWallProps | undefined;
    notes: NoteProps[] | undefined;
  }>;
  send: (resourceId: string, event: ActionPayload) => Promise<void>;
};
export type WSProvider = {
  send: (event: ActionPayload) => Promise<void>;
  close: () => void;
};
export type WebsocketState = {
  maxAttempts: number;
  readyState: boolean;
  maxConnectedUsers: number;
  connectedUsers: ConnectedUsers[];
  moveUsers: MoveUser[];
  mode: Mode;
  resourceId: string;
  subscribers: Array<Subscriber>;
  status: Status;
  openSocketModal: boolean;
  httpProvider?: HttpProvider;
  wsProvider?: WSProvider;
  isVisible: boolean;
  showCursors: boolean;
};
export type ModifiedDate = { $date: number };
export type ActionType = 'Undo' | 'Redo' | 'Do';
export type ActionData = { actionType: ActionType; actionId: string };
export type WebsocketAction = {
  setResourceId: (resourceId: string) => void;
  setMaxConnectedUsers: (maxConnectedUsers: number) => void;
  setConnectedUsers: (connectedUsers: ConnectedUsers[]) => void;
  setMoveUsers: (moveUser: MoveUser) => void;
  setRemoveMoveUser: (id: string) => void;
  onReady: (mode: Mode) => void;
  onClose: () => void;
  disconnect: () => void;
  send: (payload: ActionPayload) => Promise<void>;
  subscribe(callback: Subscriber): Subscription;
  queryForMetadata: () => Promise<void>;
  setIsVisible: (value: boolean) => void;
  setShowCursors: (value: boolean) => void;
  sendPing: () => Promise<void>;
  sendWallDeletedEvent: () => Promise<void>;
  sendWallUpdateEvent: (wall: CollaborativeWallPayload) => Promise<void>;
  sendNoteAddedEvent: (note: PickedNoteProps & ActionData) => Promise<void>;
  sendNoteCursorMovedEvent: (move: MoveList) => Promise<void>;
  sendNoteEditionEndedEvent: (noteId: string) => Promise<void>;
  sendNoteMovedEvent: (
    noteId: string,
    note: PickedNotePosition,
  ) => Promise<void>;
  sendNoteUpdated: (note: PickedNoteUpdate & ActionData) => Promise<void>;
  sendNoteEditionStartedEvent: (noteId: string) => Promise<void>;
  sendNoteSeletedEvent: (noteId: string, selected: boolean) => Promise<void>;
  sendNoteDeletedEvent: (arg: { _id: string } & ActionData) => Promise<void>;
  setOpenSocketModal: (value: boolean) => void;
};

export type CollaborativeWallPayload = Pick<
  CollaborativeWallProps,
  '_id' | 'name' | 'description' | 'background' | 'icon'
>;

export type CollaborativeWallNotePayload = Pick<
  NoteProps,
  '_id' | 'content' | 'owner' | 'x' | 'y' | 'color' | 'zIndex'
>;

export type ConnectedUsers = {
  id: string;
  name: string;
  groupIds: string[];
};

export type MetadataPayload = {
  wallId: string;
  type: 'metadata';
};

export type MetadataEvent = {
  wallId: string;
  type: 'metadata';
  connectedUsers: ConnectedUsers[];
  maxConnectedUsers: number;
};

export type PingPayload = {
  wallId: string;
  type: 'ping';
};

export type WallUpdatedPayload = {
  wallId: string;
  type: 'wallUpdate';
  wall: CollaborativeWallPayload;
};

export type WallDeletedPayload = {
  wallId: string;
  type: 'wallDeleted';
};

export type NoteAddedPayloadAction = {
  wallId: string;
  type: 'noteAdded';
  note: PickedNoteProps & {
    idwall: string;
  };
};

export type MoveList = Array<{ x: number; y: number }>;

export type CursorMovedPayload = {
  wallId: string;
  type: 'cursorMove';
  move: MoveList;
};

export type CursorMovedEvent = {
  userId: string;
} & CursorMovedPayload;

export type NoteEditionStartedPayload = {
  wallId: string;
  type: 'noteEditionStarted';
  noteId: string;
};

export type NoteEditionFinishedPayload = {
  wallId: string;
  type: 'noteEditionEnded';
  noteId: string;
};

export type PickedNotePosition = Pick<NoteProps, '_id' | 'x' | 'y'>;

export type NoteMovedPayload = {
  wallId: string;
  type: 'noteMoved';
  noteId: string;
  note: PickedNotePosition;
};

// TODO
export type PickedNoteUpdate = Pick<
  NoteProps,
  '_id' | 'content' | 'media' | 'color' | 'x' | 'y' | 'isMediaVisible'
>;

export type NoteUpdatedPayload = {
  type: 'noteUpdated';
  wallId: string;
  noteId: string;
};

export type NoteUpdatedPayloadEvent = {
  oldNote: NoteProps;
  userId: string;
  note: NoteProps;
} & NoteUpdatedPayload;

export type NoteUpdatedPayloadAction = {
  note: PickedNoteUpdate & { modified?: { $date: number } };
} & NoteUpdatedPayload;

// TODO fin

export type NoteSelectedPayload = {
  wallId: string;
  type: 'noteSelected' | 'noteUnselected';
  noteId: string;
};

export type NoteDeletedPayload = {
  wallId: string;
  type: 'noteDeleted';
  noteId: string;
};

export type NoteDeletedPayloadAction = NoteDeletedPayload;

export type NoteDeletedPayloadEvent = {
  note: NoteProps;
  userId: string;
} & NoteDeletedPayload;

export type NoteAddedPayloadEvent = {
  wallId: string;
  type: 'noteAdded';
  userId: string;
  note: NoteProps & {
    idwall: string;
  };
};

export type ConnectionPayloadEvent = {
  wallId: string;
  userId: string;
  type: 'connection';
};

export type DisconnectionPayloadEvent = {
  wallId: string;
  userId: string;
  type: 'disconnection';
  /* note: NoteProps & {
    idwall: string;
  }; */
};
export type EventPayload = (
  | MetadataEvent
  | PingPayload
  | WallUpdatedPayload
  | WallDeletedPayload
  | NoteAddedPayloadEvent
  | CursorMovedEvent
  | NoteEditionStartedPayload
  | NoteEditionFinishedPayload
  | NoteMovedPayload
  | NoteUpdatedPayloadEvent
  | NoteSelectedPayload
  | NoteDeletedPayloadEvent
  | DisconnectionPayloadEvent
  | ConnectionPayloadEvent
) &
  ActionData;

export type ActionPayload = (
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
  | NoteDeletedPayloadAction
) &
  ActionData;

export type Subscriber = (event: EventPayload) => void;
export type Subscription = () => void;
