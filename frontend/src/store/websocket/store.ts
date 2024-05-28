import { v4 as uuid } from "uuid";
import { create } from "zustand";

import {
  Mode,
  Status,
  Subscriber,
  WebsocketAction,
  WebsocketState,
} from "~/store/websocket/types";

const websocketState = {
  maxAttempts: 5,
  maxConnectedUsers: 0,
  readyState: false,
  mode: Mode.WS,
  status: Status.IDLE,
  connectedUsers: [],
  moveUsers: [],
  resourceId: "",
  subscribers: [],
  openSocketModal: false,
  isVisible: false,
};

export const useWebsocketStore = create<WebsocketState & WebsocketAction>(
  (set, get) => {
    return {
      ...websocketState,
      onReady(mode) {
        if (mode === Mode.HTTP) {
          set({ openSocketModal: true });
        } else {
          // connected to websocket once => should be able to reconnect even if network is unstable
          set({ maxAttempts: Infinity });
        }
        set({ mode, status: Status.STARTED, readyState: true });
      },
      onClose() {
        set({ status: Status.STOPPED });
      },
      disconnect: () => {
        const { mode, wsProvider, status } = get();
        if (status !== Status.STARTED) {
          return;
        }
        if (mode === Mode.WS) {
          wsProvider?.close();
        }
        set({ status: Status.STOPPED, readyState: false });
      },
      setIsVisible: (isVisible) => set({ isVisible }),
      setResourceId(resourceId) {
        set({ resourceId });
      },
      setMaxConnectedUsers: (maxConnectedUsers) => set({ maxConnectedUsers }),
      setConnectedUsers: (connectedUsers) => set({ connectedUsers }),
      setMoveUsers: (moveUser) =>
        set((state) => {
          const existingUserIndex = state.moveUsers.findIndex(
            (user) => user.id === moveUser.id,
          );

          if (existingUserIndex !== -1) {
            return {
              moveUsers: state.moveUsers.map((user, index) =>
                index === existingUserIndex
                  ? {
                      ...user,
                      x: moveUser.x,
                      y: moveUser.y,
                    }
                  : user,
              ),
            };
          } else {
            return { moveUsers: [...state.moveUsers, moveUser] };
          }
        }),
      setRemoveMoveUser: (id) => {
        set((state) => ({
          moveUsers: state.moveUsers.filter((moveUser) => moveUser.id !== id),
        }));
      },
      send: async (payload) => {
        const { mode, resourceId, httpProvider, wsProvider } = get();
        if (mode === Mode.HTTP) {
          if (!httpProvider) {
            throw "[store][send] Http provider not defined";
          }
          await httpProvider.send(resourceId, payload);
        } else {
          if (!wsProvider) {
            throw "[store][send] WS provider not defined";
          }
          wsProvider.send(payload);
        }
      },
      subscribe: (subscriber: Subscriber) => {
        const { subscribers } = get();
        set({ subscribers: [...subscribers, subscriber] });
        return () => {
          set({ subscribers: subscribers.filter((sub) => sub !== subscriber) });
        };
      },
      queryForMetadata() {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "metadata",
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendPing() {
        const { send, resourceId: wallId, mode } = get();
        if (mode === Mode.HTTP) {
          // skip in http mode
          return Promise.resolve();
        }
        return send({
          wallId,
          type: "ping",
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendWallUpdateEvent(wall) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "wallUpdate",
          wall,
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendWallDeletedEvent() {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "wallDeleted",
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendNoteAddedEvent(note) {
        const { send, resourceId: wallId } = get();
        const { color, content, media, x, y, modified, ...other } = note;
        return send({
          wallId,
          type: "noteAdded",
          note: {
            color,
            content,
            media,
            x,
            y,
            modified,
            idwall: wallId,
          },
          ...other,
        });
      },
      sendNoteCursorMovedEvent(move) {
        const { send, resourceId: wallId, mode } = get();
        if (mode === Mode.HTTP) {
          // skip in http mode
          return Promise.resolve();
        }
        return send({
          wallId,
          type: "cursorMove",
          move,
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendNoteEditionStartedEvent(noteId) {
        const { send, resourceId: wallId, mode } = get();
        if (mode === Mode.HTTP) {
          // skip in http mode
          return Promise.resolve();
        }
        return send({
          wallId,
          type: "noteEditionStarted",
          noteId,
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendNoteEditionEndedEvent(noteId) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteEditionEnded",
          noteId,
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendNoteMovedEvent(noteId, note) {
        const { send, resourceId: wallId, mode } = get();
        if (mode === Mode.HTTP) {
          // skip in http mode
          return Promise.resolve();
        }
        return send({
          wallId,
          type: "noteMoved",
          noteId,
          note,
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendNoteUpdated(note) {
        const { send, resourceId: wallId } = get();
        const { _id, color, content, media, x, y, ...other } = note;
        return send({
          wallId,
          type: "noteUpdated",
          noteId: note._id,
          note: {
            _id,
            color,
            content,
            media,
            x,
            y,
          },
          ...other,
        });
      },
      sendNoteSeletedEvent(noteId, selected) {
        const { send, resourceId: wallId, mode } = get();
        if (mode === Mode.HTTP) {
          // skip in http mode
          return Promise.resolve();
        }
        return send({
          wallId,
          type: selected ? "noteSelected" : "noteUnselected",
          noteId,
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendNoteDeletedEvent({ _id, ...actionData }) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteDeleted",
          noteId: _id,
          ...actionData,
        });
      },
      setOpenSocketModal: (openSocketModal) => set({ openSocketModal }),
    };
  },
);
