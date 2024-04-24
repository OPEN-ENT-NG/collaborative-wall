import { useEffect } from "react";
import { createWebsocketStore } from "~/store/websocket/store";
import { Mode, Status } from "~/store/websocket/types";
import { useHttpMode } from "./use-http-mode";
import { useWSMode } from "./use-ws-mode";

export const useWebsocketStore = () => {
  const store = createWebsocketStore();
  const httpProvider = useHttpMode(store.mode === Mode.HTTP, store.resourceId);
  const wsProvider = useWSMode({
    enabled: store.mode === Mode.WS,
    onOpen() {
      store.onReady(Mode.WS);
    },
    onClose() {
      if (store.mode === Mode.WS && store.status === Status.STARTED) {
        store.disconnect();
      }
    },
    onMessage(event) {
      if (store.mode === Mode.WS) {
        store.subscribers.forEach((sub) => sub(event));
      }
    },
    onReconnectStop() {
      store.onReady(Mode.HTTP);
    },
    reconnectAttempts: store.maxAttempts,
    wallId: store.resourceId,
  });

  useEffect(() => {
    /* Correctly use setState from zustand to update the store */
    createWebsocketStore.setState((state) => ({
      ...state,
      httpProvider: httpProvider,
      wsProvider,
    }));

    // return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
};
