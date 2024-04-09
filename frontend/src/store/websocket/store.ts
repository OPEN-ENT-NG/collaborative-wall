import { create } from "zustand";

import {
  WebsocketState,
  WebsocketAction,
  WebSocketMode,
  WebsocketStatus,
  EventPayload,
  CollaborativeWallPayload,
  CollaborativeWallNotePayload,
  PickedNotePosition,
  PickedNoteContent,
  PickedNoteImage,
  MoveList,
} from "~/store/websocket/types";

const websocketState = {
  ready: false,
  mode: WebSocketMode.WS,
  isOpened: false,
  status: WebsocketStatus.IDLE,
  resourceId: "",
  subscribers: [],
  openSocketModal: false,
};

const DELAY = 20000;
const RETRY_COUNTER = 5;

export const useWebsocketStore = create<WebsocketState & WebsocketAction>(
  (set, get) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let socket: WebSocket | undefined;
    let interval: number | undefined;

    return {
      ...websocketState,
      startRealTime: (resourceId, start) => {
        console.log({ resourceId, start });

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
        console.log("start");
        await get().doStart();
        set({ status: WebsocketStatus.STARTED });
        return true;
      },
      stop: async () => {
        await get().doStop();
        set({ status: WebsocketStatus.STOPPED });
        return false;
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
        const { subscribers, start } = get();

        socket?.addEventListener("open", () => {
          console.log("open");
          get().queryForMetadata();
          set({ isOpened: socket?.readyState === 1 ? true : false });
          console.log(socket?.readyState);
        });
        socket?.addEventListener("message", (event) => {
          console.log(socket?.readyState);
          try {
            const data = JSON.parse(event.data);
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
        console.log("do start");
        const { mode, subscribers, resourceId, startListeners } = get();

        if (mode === WebSocketMode.HTTP) {
          interval = setInterval(async () => {
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
                  note: note as any,
                });
              }
            }
          }, DELAY) as unknown as number;
          set({ ready: true });
        } else {
          // try start ws multiple times
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
          return (interval = setInterval(async () => {
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
                  note: note as any,
                });
              }
            }
          }, DELAY) as unknown as number);
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
          // this.pendingStart = undefined;
        }
      },
      send: async (payload: EventPayload) => {
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

        console.log("send ping");

        return send({
          wallId,
          type: "ping",
        });
      },
      sendWallUpdateEvent(wall: CollaborativeWallPayload) {
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
      sendNoteAddedEvent(note: CollaborativeWallNotePayload) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteAdded",
          note: {
            ...note,
            idwall: this.resourceId,
          },
        });
      },
      sendNoteCursorMovedEvent(move: MoveList) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "cursorMove",
          move,
        });
      },
      sendNoteEditionStartedEvent(noteId: string) {
        return get().send({
          wallId,
          type: "noteEditionStarted",
          noteId,
        });
      },
      sendNoteEditionEndedEvent(noteId: string) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteEditionEnded",
          noteId,
        });
      },
      sendNoteMovedEvent(noteId: string, note: PickedNotePosition) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteMoved",
          noteId,
          note,
        });
      },
      sendNoteTextUpdatedEvent(note: PickedNoteContent) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteTextUpdated",
          noteId: note._id,
          note,
        });
      },
      sendNoteImageUpdatedEvent(note: PickedNoteImage) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteImageUpdated",
          noteId: note._id,
          note,
        });
      },
      sendNoteSeletedEvent(noteId: string, selected: boolean) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: selected ? "noteSelected" : "noteUnselected",
          noteId,
        });
      },
      sendNoteDeletedEvent(noteId: string) {
        const { send, resourceId: wallId } = get();

        return send({
          wallId,
          type: "noteDeleted",
          noteId,
        });
      },
      setOpenSocketModal: (openSocketModal) => set({ openSocketModal }),
    };
  },
);
