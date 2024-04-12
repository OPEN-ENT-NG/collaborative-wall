import { odeServices } from "edifice-ts-client";
import { v4 as uuid } from "uuid";
import { create } from "zustand";

import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";
import {
  WebsocketState,
  WebsocketAction,
  Mode,
  Status,
  Subscriber,
  EventPayload,
} from "~/store/websocket/types";

const websocketState = {
  connectionAttempts: 0,
  maxAttempts: 5,
  maxConnectedUsers: 0,
  mode: Mode.WS,
  status: Status.IDLE,
  connectedUsers: [],
  moveUsers: [],
  resourceId: "",
  subscribers: [],
  openSocketModal: false,
};

const DELAY = 20000;

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
      connectionAttempts: 0,
      maxAttempts: 5,
      connect: async (resourceId) => {
        const { maxAttempts, mode, subscribers, connectionAttempts } = get();
        const localhost = window.location.hostname === "localhost";

        set({ resourceId });

        if (mode === Mode.HTTP) {
          interval = startHttpListener(resourceId, subscribers, DELAY);
          set({ status: Status.STARTED });
        } else {
          for (let i = 0; i <= maxAttempts; i++) {
            console.log(`Connecting...`);

            set((state) => ({
              connectionAttempts: state.connectionAttempts + 1,
            }));

            if (connectionAttempts === maxAttempts) {
              // If Websocket has not started, fallback to HTTP mode
              set({
                mode: Mode.HTTP,
                status: Status.STARTED,
                openSocketModal: true,
              });
              socket?.close();
              interval = startHttpListener(resourceId, subscribers, DELAY);
              break;
            }

            socket = new WebSocket(
              localhost
                ? `ws://${window.location.hostname}:9091/collaborativewall/${resourceId}`
                : `ws://${window.location.host}/collaborativewall/realtime/${resourceId}`,
            );

            await new Promise(() => {
              socket?.addEventListener("open", () => {
                console.log(`Connected...`);
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
                  // If Websocket closes, we try to reconnect
                  get().connect(resourceId);
                }
              });
              socket?.addEventListener("error", (event) => {
                console.error(
                  "[collaborativewall][realtime] Server has sent error:",
                  event,
                );
              });
            });

            // When a Websocket is opened, readyState === 1 / WebSocket.OPEN
            if (socket.readyState === WebSocket.OPEN) {
              set({ mode: Mode.WS, status: Status.STARTED });
              break;
            }
          }
        }
      },
      disconnect: () => {
        const { mode } = get();

        if (mode === Mode.HTTP) {
          clearInterval(interval);
          interval = undefined;
        } else {
          socket?.close();
          socket = undefined;
        }

        set({ status: Status.STOPPED });
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
                  ? { ...user, x: moveUser.x, y: moveUser.y }
                  : user,
              ),
            };
          } else {
            return { moveUsers: [...state.moveUsers, moveUser] };
          }
        }),
      send: async (payload) => {
        const { mode, resourceId } = get();

        if (mode === Mode.HTTP) {
          await odeServices
            .http()
            .putJson(`/collaborativewall/${resourceId}/event`, payload);
        } else {
          socket?.send(JSON.stringify(payload));
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
    };
  },
);
