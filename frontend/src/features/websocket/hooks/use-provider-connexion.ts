import { useEffect } from "react";
import { useWall } from "~/services/queries";
import { useWebsocketStore } from "~/store/websocket/store";
import { Mode } from "~/store/websocket/types";
import { useHttpMode } from "./use-http-mode";
import { useWSMode } from "./use-ws-mode";

export const useProviderConnection = () => {
  const { wall } = useWall();

  const mode = useWebsocketStore((state) => state.mode);
  const resourceId = useWebsocketStore((state) => state.resourceId);

  const httpProvider = useHttpMode(mode === Mode.HTTP, resourceId);
  const wsProvider =
    useWSMode(/* {
    onMessage(event) {
      if (store.mode === Mode.WS) {
        store.subscribers.forEach((sub) => sub(event));
      }
    },
  } */);

  useEffect(() => {
    /* Correctly use setState from zustand to update the store */
    useWebsocketStore.setState((state) => ({
      ...state,
      resourceId: wall?._id,
      httpProvider,
      wsProvider,
    }));

    // return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
