import React from "react";
import ReactFlow from "reactflow";
import { nodeExtent, translateExtent } from "~/config/wallConfig";
import { useCustomReactFlow } from "~/hooks/useCustomReactFlow";
import { useWhiteboardStore } from "~/store";
import { CollaborativeWallBackground } from "./WallBackground";
import { CollaborativeWallToolbar } from "./WallToolbar";

export const WallReactFlow = React.memo(() => {
  const dropdownState = useWhiteboardStore((state) => state.dropdownState);

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

  return (
    <div className="collaborativewall-reactflow">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        translateExtent={translateExtent}
        nodeExtent={nodeExtent}
        maxZoom={2}
        panOnScroll={true}
        nodesFocusable={false}
        nodeDragThreshold={1}
        onInit={onInit}
        nodesDraggable={isMobile ? false : true}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneMouseMove={onPaneMouseMove}
        panOnDrag={!dropdownState.isOpen}
      >
        <CollaborativeWallBackground />
        <CollaborativeWallToolbar />
      </ReactFlow>
    </div>
  );
});
