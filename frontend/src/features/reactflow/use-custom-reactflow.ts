import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Node, NodeChange, applyNodeChanges } from "reactflow";
// import { useAccess } from "~/hooks/use-access";
import { useAccessStore } from "~/hooks/use-access-rights";
import { useEditNote } from "~/hooks/use-edit-note";
import { useThrottledFunction } from "~/hooks/use-throttled-function";
import { NoteProps } from "~/models/notes";
import { useNotes } from "~/services/queries";
import { useWhiteboard } from "~/store";
import { Note } from "../collaborative-wall/components/note";
import { useWebsocketStore } from "../websocket/hooks/use-websocket-store";

export const useCustomRF = () => {
  const [nodes, setNodes] = useState<Node[]>([]);

  const nodeTypes = useMemo(() => ({ note: Note }), []);
  const isMobile = useWhiteboard((state) => state.isMobile);
  const navigate = useNavigate();

  const { notes } = useNotes();
  const { handleOnDragEnd, handleOnDragStart } = useEditNote();
  const { sendNoteMovedEvent, sendNoteCursorMovedEvent } = useWebsocketStore();
  const { hasRightsToMoveNote } = useAccessStore();

  const callbackFnToThrottlePosition = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      sendNoteCursorMovedEvent([{ x, y }]);
    },
    [sendNoteCursorMovedEvent],
  );

  const { throttledFn: throttledPosition } = useThrottledFunction<{
    x: number;
    y: number;
  }>({
    callbackFn: callbackFnToThrottlePosition,
  });

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

  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (event) {
        throttledPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [throttledPosition],
  );

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const coordinates = {
        x: node.position.x,
        y: node.position.y,
      };
      if (coordinates) {
        throttledOnMove({ _id: node.id, ...coordinates });
        throttledPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [throttledOnMove, throttledPosition],
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
    nodeTypes,
    onNodesChange,
    onNodeClick,
    onNodeDrag,
    onNodeDragStop,
    onNodeDragStart,
    onPaneMouseMove,
  };
};
