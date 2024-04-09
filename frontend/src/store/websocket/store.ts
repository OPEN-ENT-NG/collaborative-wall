import { create } from "zustand";

import { EventPayload } from "~/services/realtime/types";
import {
  WebsocketState,
  WebsocketAction,
  WebSocketMode,
  WebsocketStatus,
  Subscriber,
} from "~/store/websocket/types";

const websocketState = {
  ready: false,
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
      fetch(`/collaborativewall/${resourceId}`),
      fetch(`/collaborativewall/${resourceId}/notes`),
    ]);
    for (const sub of subscribers) {
      sub({
        type: "wallUpdate",
        wallId: (wall as any)._id,
        wall: wall as any,
      });
      for (const note of notes as any) {
        sub({
          type: "noteAdded",
          wallId: (wall as any)._id,
          note: note,
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
          console.log("on open");
          get().queryForMetadata();
          set({ isOpened: socket?.readyState === 1 ? true : false });
        });
        socket?.addEventListener("message", (event) => {
          try {
            const { subscribers } = get();
            const data = JSON.parse(event.data) as EventPayload;
            subscribers.forEach((sub) => sub(data));
            // get().subscribe(event.data);
            // set({ lastEvent: event.data });
          } catch (error) {
            console.error(
              "[collaborativewall][realtime] Could not parse message:",
              error,
            );
          }
        });
        socket?.addEventListener("close", (event) => {
          if (!event.wasClean) {
            // this.pendingStart?.reject(event.reason);
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
        });
      },
      sendPing() {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "ping",
        });
      },
      sendWallUpdateEvent(wall) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "wallUpdate",
          wall,
        });
      },
      sendWallDeletedEvent() {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "wallDeleted",
        });
      },
      sendNoteAddedEvent(note) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteAdded",
          note: {
            ...note,
            idwall: wallId,
          },
        });
      },
      sendNoteCursorMovedEvent(move) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "cursorMove",
          move,
        });
      },
      sendNoteEditionStartedEvent(noteId) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteEditionStarted",
          noteId,
        });
      },
      sendNoteEditionEndedEvent(noteId) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteEditionEnded",
          noteId,
        });
      },
      sendNoteMovedEvent(noteId, note) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteMoved",
          noteId,
          note,
        });
      },
      sendNoteTextUpdatedEvent(note) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteTextUpdated",
          noteId: note._id,
          note,
        });
      },
      sendNoteImageUpdatedEvent(note) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteImageUpdated",
          noteId: note._id,
          note,
        });
      },
      sendNoteSeletedEvent(noteId, selected) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: selected ? "noteSelected" : "noteUnselected",
          noteId,
        });
      },
      sendNoteDeletedEvent(noteId) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteDeleted",
          noteId,
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
