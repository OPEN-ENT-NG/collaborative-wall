import { LoadingScreen } from "@edifice-ui/react";
import { Outlet } from "react-router-dom";
import ReactFlow from "reactflow";
import "reactflow/dist/base.css";
import { useShallow } from "zustand/react/shallow";
import { EmptyScreenError } from "~/components/EmptyScreenError/EmptyScreenError";
import { nodeExtent, translateExtent } from "~/config";
import { RenderedCursors } from "~/features/websocket/components/WebsocketRenderedCursor";
import { useEvents } from "~/features/websocket/hooks/useEvents";
import { useProviderConnection } from "~/features/websocket/hooks/useProviderConnection";
import { useCustomReactFlow } from "~/hooks/useCustomReactFlow";
import { useNotes, useWall } from "~/services/queries";
import { useWebsocketStore, useWhiteboardStore } from "~/store";
import { Mode, Status } from "~/store/websocket/types";
import { CollaborativeWallBackground } from "./WallBackground";
import { CollaborativeWallContainer } from "./WallContainer";
import { CollaborativeWallToolbar } from "./WallToolbar";

/* Lazy Loaded Modal */

export const Wall = () => {
  /* Get fresh data from react query */
  const { wall, query } = useWall();
  const { notes } = useNotes();

  /* Collaborative Store */
  const { dropdownState, isMobile } = useWhiteboardStore(
    useShallow((state) => ({
      isMobile: state.isMobile,
      dropdownState: state.dropdownState,
    })),
  );

  /* Websocket Store */
  const { mode, status, readyState } = useWebsocketStore(
    useShallow((state) => ({
      mode: state.mode,
      status: state.status,
      readyState: state.readyState,
    })),
  );

  /* React Flow */
  const {
    nodes,
    nodeTypes,
    onInit,
    onNodesChange,
    onNodeClick,
    onNodeDrag,
    onNodeDragStop,
    onNodeDragStart,
    onPaneMouseMove,
  } = useCustomReactFlow();

  const isWebsocketMode = mode === Mode.WS;
  const isIDLE = status === Status.IDLE;
  const isPending = query.isPending;

  /* Hook to check HTTP or Websocket connection */
  useProviderConnection();

  /* Websocket Events */
  useEvents();

  if (isPending || !readyState || isIDLE)
    return <LoadingScreen position={false} />;

  if (!wall || !notes || query.isError) return <EmptyScreenError />;

  return (
    <CollaborativeWallContainer>
      <div className="collaborativewall-reactflow">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          translateExtent={translateExtent}
          nodeExtent={nodeExtent}
          minZoom={1}
          maxZoom={1}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnScroll={true}
          nodesFocusable={false}
          nodeDragThreshold={1}
          onInit={onInit}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onPaneMouseMove={onPaneMouseMove}
          panOnDrag={!dropdownState.isOpen}
        >
          {isWebsocketMode && <RenderedCursors />}
          <CollaborativeWallBackground />
          <CollaborativeWallToolbar isMobile={isMobile} />
        </ReactFlow>
      </div>

      <Outlet />
    </CollaborativeWallContainer>
  );
};
