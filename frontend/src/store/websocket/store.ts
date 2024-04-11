import { create } from "zustand";

import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";
import {
  WebsocketState,
  WebsocketAction,
  WebSocketMode,
  WebsocketStatus,
  Subscriber,
  EventPayload,
} from "~/store/websocket/types";
import { uuid } from "~/utils/uuid";

const websocketState = {
  ready: false,
  connectedUsers: [],
  moveUsers: [],
  mode: WebSocketMode.WS,
  isOpened: false,
  status: WebsocketStatus.IDLE,
  resourceId: "",
  subscribers: [],
  openSocketModal: false,
  lastEvent: null,
};

const DELAY = 20000;
const RETRY_COUNTER = 5;

const startHttpListener = (
  resourceId: string,
  subscribers: Subscriber[],
  DELAY: number,
) => {
  return setInterval(async () => {
    const [wall, notes] = await Promise.all([
      fetch(`/collaborativewall/${resourceId}`).then((j) => j.json()),
      fetch(`/collaborativewall/${resourceId}/notes`).then((j) => j.json()),
    ]);
    for (const sub of subscribers) {
      sub({
        type: "wallUpdate",
        wallId: (wall as CollaborativeWallProps)._id,
        wall: wall as CollaborativeWallProps,
        actionType: "Do",
        actionId: uuid(),
      });
      for (const note of notes as NoteProps[]) {
        sub({
          type: "noteAdded",
          wallId: (wall as CollaborativeWallProps)._id,
          note: note,
          actionType: "Do",
          actionId: uuid(),
        });
      }
    }
  }, DELAY) as unknown as number;
};

export const useWebsocketStore = create<WebsocketState & WebsocketAction>(
  (set, get) => {
    let socket: WebSocket | undefined;
    let interval: number | undefined;

    return {
      ...websocketState,
      startRealTime: (resourceId, start) => {
        set({ resourceId });

        if (start) {
          get().start();
        }
      },
      stopRealTime: () => {
        const { stop } = get();

        stop();
      },
      start: async () => {
        await get().doStart();
        set({ status: WebsocketStatus.STARTED });
      },
      stop: async () => {
        await get().doStop();
        set({ status: WebsocketStatus.STOPPED });
      },
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
                  ? { ...user, x: moveUser.x, y: moveUser.y }
                  : user,
              ),
            };
          } else {
            return { moveUsers: [...state.moveUsers, moveUser] };
          }
        }),
      subscribe: (callback) => {
        set((state) => ({ subscribers: [...state.subscribers, callback] }));
        return () => {
          set((state) => ({
            subscribers: state.subscribers.filter((cb) => cb !== callback),
          }));
        };
      },
      startListeners: () => {
        const { start } = get();

        socket?.addEventListener("open", () => {
          get().queryForMetadata();
          set({ isOpened: socket?.readyState === 1 ? true : false });
        });
        socket?.addEventListener("message", (event) => {
          try {
            const { subscribers } = get();
            const data = JSON.parse(event.data) as EventPayload;
            subscribers.forEach((sub) => sub(data));
          } catch (error) {
            console.error(
              "[collaborativewall][realtime] Could not parse message:",
              error,
            );
          }
        });
        socket?.addEventListener("close", (event) => {
          if (!event.wasClean) {
            console.warn(
              "[collaborativewall][realtime] Server closed connection unilaterally. restarting...",
              event,
            );
            start();
          }
        });
        socket?.addEventListener("error", (event) => {
          console.error(
            "[collaborativewall][realtime] Server has sent error:",
            event,
          );
        });
      },
      doStart: async () => {
        const { mode, subscribers, resourceId, startListeners } = get();

        if (mode === WebSocketMode.HTTP) {
          interval = startHttpListener(resourceId, subscribers, DELAY);
          set({ ready: true });
        } else {
          for (let i = 0; i < RETRY_COUNTER; i++) {
            try {
              if (window.location.hostname === "localhost") {
                socket = new WebSocket(
                  `ws://${window.location.hostname}:9091/collaborativewall/${resourceId}`,
                );
              } else {
                socket = new WebSocket(
                  `ws://${window.location.host}/collaborativewall/realtime/${resourceId}`,
                );
              }
              startListeners();
              set({ ready: true, mode: WebSocketMode.WS });
              return;
            } catch (e) {
              // retry...
            }
          }

          // websocket has not started => http mode
          set({ mode: WebSocketMode.HTTP });
          interval = startHttpListener(resourceId, subscribers, DELAY);
        }
      },
      doStop: () => {
        const { mode } = get();

        if (mode === WebSocketMode.HTTP) {
          clearInterval(interval);
          interval = undefined;
        } else {
          socket?.close();
          socket = undefined;
        }
      },
      send: async (payload) => {
        const { mode, resourceId } = get();

        if (mode === WebSocketMode.HTTP) {
          await fetch(`/collaborativewall/${resourceId}/event`, {
            body: JSON.stringify(payload),
            method: "PUT",
          });
        } else {
          socket?.send(JSON.stringify(payload));
        }
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
        const { send, resourceId: wallId } = get();

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
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "cursorMove",
          move,
          actionType: "Do",
          actionId: uuid(),
        });
      },
      sendNoteEditionStartedEvent(noteId) {
        const { send, resourceId: wallId } = get();

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
        const { send, resourceId: wallId } = get();

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
      /* sendNoteImageUpdatedEvent(note) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteImageUpdated",
          noteId: note._id,
          note,
        });
      }, */
      sendNoteSeletedEvent(noteId, selected) {
        const { send, resourceId: wallId } = get();

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
      listen: (cb: Subscriber) => {
        const { subscribers } = get();
        set({ subscribers: [...subscribers, cb] });
        return () => {
          set({ subscribers: subscribers.filter((c) => c !== cb) });
        };
      },
    };
  },
);
