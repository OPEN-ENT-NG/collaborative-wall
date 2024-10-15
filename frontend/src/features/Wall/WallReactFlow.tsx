import React from 'react';
import ReactFlow from 'reactflow';
import { nodeExtent, translateExtent } from '~/config/wallConfig';
import { useCustomReactFlow } from '~/hooks/useCustomReactFlow';
import { useWhiteboardStore } from '~/store';
import { CollaborativeWallBackground } from './WallBackground';
import { CollaborativeWallToolbar } from './WallToolbar';

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
        <CollaborativeWallBackground />
        <CollaborativeWallToolbar />
      </ReactFlow>
    </div>
  );
});
