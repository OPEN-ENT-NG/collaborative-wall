import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Node, NodeChange, applyNodeChanges } from "reactflow";
import { useAccess } from "~/hooks/use-access";
import { useEditNote } from "~/hooks/use-edit-note";
import { useThrottledFunction } from "~/hooks/use-throttled-function";
import { NoteProps } from "~/models/notes";
import { useWhiteboard } from "~/store";
import { useWebsocketStore } from "../websocket/hooks/use-websocket-store";

export const useCustomRF = (notes: NoteProps[] | undefined) => {
  const [nodes, setNodes] = useState<Node[]>([]);

  const isMobile = useWhiteboard((state) => state.isMobile);
  const navigate = useNavigate();

  const { handleOnDragEnd, handleOnDragStart } = useEditNote();
  const { sendNoteMovedEvent } = useWebsocketStore();
  const { hasRightsToMoveNote } = useAccess();

  useEffect(() => {
    if (notes) {
      const newNodes = notes
        ?.sort(
          (a: NoteProps, b: NoteProps) =>
            (a.modified?.$date ?? 0) - (b.modified?.$date ?? 0),
        )
        .map((note, index) => {
          return {
            id: note._id,
            type: "note",
            data: { note },
            position: { x: note.x, y: note.y },
            draggable: hasRightsToMoveNote(note),
            zIndex: index,
          };
        });
      setNodes(newNodes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      !isMobile ? navigate(`note/${node.id}?mode=read`) : undefined;
    },
    [isMobile, navigate],
  );

  const callbackFnToThrottle = useCallback(
    ({ _id, x, y }: { _id: string; x: number; y: number }) => {
      sendNoteMovedEvent(_id, {
        _id,
        x,
        y,
      });
    },
    [sendNoteMovedEvent],
  );

  const { throttledFn: throttledOnMove } = useThrottledFunction<{
    _id: string;
    x: number;
    y: number;
  }>({
    callbackFn: callbackFnToThrottle,
  });

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const coordinates = {
        x: node.position.x,
        y: node.position.y,
      };
      if (coordinates) {
        throttledOnMove({ _id: node.id, ...coordinates });
      }
    },
    [throttledOnMove],
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      handleOnDragEnd({
        id: node.id,
        coordinates: { x: node.position.x, y: node.position.y },
      });
    },
    [handleOnDragEnd],
  );

  const onNodeDragStart = useCallback(
    () => handleOnDragStart(),
    [handleOnDragStart],
  );

  return {
    nodes,
    onNodesChange,
    onNodeClick,
    onNodeDrag,
    onNodeDragStop,
    onNodeDragStart,
  };
};
