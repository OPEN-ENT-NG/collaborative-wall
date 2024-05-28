import { LoadingScreen } from "@edifice-ui/react";
import { Outlet } from "react-router-dom";
import "reactflow/dist/base.css";
import { useShallow } from "zustand/react/shallow";
import { EmptyScreenError } from "~/components/EmptyScreenError/EmptyScreenError";
import { useEvents } from "~/features/websocket/hooks/useEvents";
import { useProviderConnection } from "~/features/websocket/hooks/useProviderConnection";
import { useNotes, useWall } from "~/services/queries";
import { useWebsocketStore } from "~/store";
import { Mode, Status } from "~/store/websocket/types";
import { WebsocketRenderedCursors } from "../websocket/components/WebsocketRenderedCursor";
import { CollaborativeWallContainer } from "./WallContainer";
import { WallReactFlow } from "./WallReactFlow";

/* Lazy Loaded Modal */
export const Wall = () => {
  /* Get fresh data from react query */
  const { wall, query } = useWall();
  const { notes } = useNotes();

  /* Websocket Store */
  const { status, readyState } = useWebsocketStore(
    useShallow((state) => ({
      status: state.status,
      readyState: state.readyState,
    })),
  );

  const isIDLE = status === Status.IDLE;
  const isPending = query.isPending;

  /* Hook to check HTTP or Websocket connection */
  useProviderConnection();

  /* Websocket Events */
  useEvents();

  const mode = useWebsocketStore((state) => state.mode);
  const isWebsocketMode = mode === Mode.WS;

  if (isPending || !readyState || isIDLE)
    return <LoadingScreen position={false} />;

  if (!wall || !notes || query.isError) return <EmptyScreenError />;

  return (
    <CollaborativeWallContainer>
      {isWebsocketMode && <WebsocketRenderedCursors />}
      <WallReactFlow />
      <Outlet />
    </CollaborativeWallContainer>
  );
};
