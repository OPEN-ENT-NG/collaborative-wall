import { useEffect } from "react";
import { useWall } from "~/services/queries";
import { useWebsocketStore } from "~/store/websocket/store";
import { Mode, Status } from "~/store/websocket/types";
import { useHttpMode } from "./use-http-mode";
import { useWSMode } from "./use-ws-mode";

export const useProviderConnection = () => {
  const { wall } = useWall();

  const mode = useWebsocketStore((state) => state.mode);

  const httpProvider = useHttpMode(mode === Mode.HTTP, wall?._id);
  const wsProvider = useWSMode();

  useEffect(() => {
    /* Correctly use setState from zustand to update the store */
    useWebsocketStore.setState((state) => ({
      ...state,
      resourceId: wall?._id,
      httpProvider,
      wsProvider,
      readyState: mode === Mode.HTTP,
      openSocketModal: mode === Mode.HTTP,
      status: mode === Mode.HTTP ? Status.STARTED : Status.IDLE,
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
