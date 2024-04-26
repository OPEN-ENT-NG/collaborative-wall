import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Node,
  NodeChange,
  ReactFlowInstance,
  applyNodeChanges,
} from "reactflow";
import { v4 as uuid } from "uuid";
import { useAccessStore } from "~/hooks/use-access-rights";
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
  const { toggleCanMoveBoard } = useWhiteboard();
  const { sendNoteMovedEvent, sendNoteCursorMovedEvent, sendNoteUpdated } =
    useWebsocketStore();
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

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
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
        instance.setNodes(newNodes);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes],
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      !isMobile ? navigate(`note/${node.id}?mode=read`) : undefined;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
    async (_event: React.MouseEvent, node: Node) => {
      toggleCanMoveBoard();

      const coordinates = { x: node.position.x, y: node.position.y };
      const activeId = node.id as string;
      const findNote = notes?.find((note) => note._id === activeId);

      if (!findNote) return;

      const position = {
        x: coordinates.x,
        y: coordinates.y,
      };

      await sendNoteUpdated({
        ...findNote,
        ...position,
        actionType: "Do",
        actionId: uuid(),
      });
    },
    [notes, sendNoteUpdated, toggleCanMoveBoard],
  );

  const onNodeDragStart = useCallback(
    () => toggleCanMoveBoard(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    nodes,
    nodeTypes,
    onInit,
    onNodesChange,
    onNodeClick,
    onNodeDrag,
    onNodeDragStop,
    onNodeDragStart,
    onPaneMouseMove,
  };
};
