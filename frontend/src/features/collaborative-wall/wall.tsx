import { LoadingScreen } from "@edifice-ui/react";
import { Outlet } from "react-router-dom";
import ReactFlow from "reactflow";
import "reactflow/dist/base.css";
import { useShallow } from "zustand/react/shallow";
import { EmptyScreenError } from "~/components/emptyscreen-error";
import { nodeExtent, translateExtent } from "~/config";
import { useNotes, useWall } from "~/services/queries";
import { useWebsocketStore, useWhiteboardStore } from "~/store";
import { Mode, Status } from "~/store/websocket/types";
import { useCustomRF } from "../reactflow/use-custom-reactflow";
import { RenderedCursors } from "../websocket/components/rendered-cursors";
import { useEvents } from "../websocket/hooks/use-events";
import { useProviderConnection } from "../websocket/hooks/use-provider-connection";
import { CollaborativeWallContainer } from "./components/collaborative-wall-container";
import { CustomBackground } from "./components/custom-background";
import { ToolbarWrapper } from "./components/toolbar";

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
  } = useCustomRF();

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
    <>
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
            nodeDragThreshold={0}
            nodesFocusable={false}
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
            <CustomBackground />
            <ToolbarWrapper isMobile={isMobile} />
          </ReactFlow>
        </div>

        <Outlet />
      </CollaborativeWallContainer>
    </>
  );
};
