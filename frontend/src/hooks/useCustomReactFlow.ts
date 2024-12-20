import { useDocumentVisibility, usePageLeave } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Node,
  NodeChange,
  ReactFlowInstance,
  applyNodeChanges,
} from 'reactflow';
import { v4 as uuid } from 'uuid';
import { useAccessStore } from '~/hooks/useAccessStore';
import { useThrottledFunction } from '~/hooks/useThrottledFunction';
import { NoteProps } from '~/models/notes';
import { useNotes } from '~/services/queries';
import { useWebsocketStore, useWhiteboardStore } from '~/store';
import { checkQueryResult } from '~/utils/checkQueryResult';
import { Note } from '../features/Note/components/Note';

declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
  }
}

export const useCustomReactFlow = () => {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<unknown, unknown>>();
  /** Creade nodes elements for React Flow and add new "note" type */
  const [nodes, setNodes] = useState<Node[]>([]);
  const nodeTypes = useMemo(() => ({ note: Note }), []);

  /* React Router useNavigate hook */
  const navigate = useNavigate();

  /* Collaborative Wall Store */
  const isMobile = useWhiteboardStore((state) => state.isMobile);
  const canMoveNote = useWhiteboardStore((state) => state.canMoveNote);
  const dropdownState = useWhiteboardStore((state) => state.dropdownState);
  const { toggleCanMoveBoard } = useWhiteboardStore();

  const documentVisible = useDocumentVisibility();
  const [moveOut, setMoveOut] = useState(0);

  usePageLeave(() => {
    setMoveOut((prev) => prev + 1);
  });

  /* Stores */
  const { sendNoteMovedEvent, sendNoteCursorMovedEvent, sendNoteUpdated } =
    useWebsocketStore();
  const { hasRightsToMoveNote } = useAccessStore();

  /* Notes data */
  const { notes, query } = useNotes();
  // check whether query succeed else throw error
  checkQueryResult(query);

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
    let timeoutId: NodeJS.Timeout | number;

    const sendEventWithDelay = () => {
      timeoutId = setTimeout(() => {
        sendNoteCursorMovedEvent([{ x: 0, y: 0 }]);
      }, 100);
    };

    if (!documentVisible || moveOut !== 0) {
      sendEventWithDelay();
    }

    return () => clearTimeout(timeoutId);
  }, [documentVisible, moveOut, sendNoteCursorMovedEvent]);

  useEffect(() => {
    if (notes && !query.isError) {
      const newNodes = notes
        ?.sort(
          (a: NoteProps, b: NoteProps) =>
            (a.modified?.$date ?? 0) - (b.modified?.$date ?? 0),
        )
        .map((note, index) => {
          return {
            id: note._id,
            type: 'note',
            data: { note },
            position: { x: note.x, y: note.y },
            draggable: !isMobile && canMoveNote && hasRightsToMoveNote(note),
            zIndex: index,
          };
        });
      setNodes(newNodes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, canMoveNote]);

  useEffect(() => {
    if (dropdownState.idDropdown) {
      setNodes((prevNodes) =>
        prevNodes.map((node, index) => ({
          ...node,
          zIndex:
            node.id === dropdownState.idDropdown && dropdownState.isOpen
              ? 1500
              : index,
        })),
      );
    }
  }, [dropdownState]);

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

  /* onInit we use React Flow instance to set nodes */
  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);

    if (notes) {
      const newNodes = notes
        ?.sort(
          (a: NoteProps, b: NoteProps) =>
            (a.modified?.$date ?? 0) - (b.modified?.$date ?? 0),
        )
        .map((note, index) => {
          return {
            id: note._id,
            type: 'note',
            data: { note },
            position: { x: note.x, y: note.y },
            draggable: !isMobile && canMoveNote && hasRightsToMoveNote(note),
            zIndex: index,
          };
        });
      instance.setNodes(newNodes);
    }
  };

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  /* onNodeClick we navigate to note modal component */
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      !isMobile
        ? navigate(`note/${node.id}?mode=read`)
        : window.ReactNativeWebView.postMessage(node.id);
    },
    [isMobile, navigate],
  );

  /* onPaneMouseMove is useful to track mouse position */
  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (event) {
        const clientCoords = { x: event.clientX, y: event.clientY };
        throttledPosition(
          reactFlowInstance?.screenToFlowPosition(clientCoords) ?? clientCoords,
        );
      }
    },
    [throttledPosition, reactFlowInstance],
  );

  /* onNodeDrag to track mouse and note positions */
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const coordinates = {
        x: node.position.x,
        y: node.position.y,
      };
      if (coordinates) {
        const clientCoords = { x: event.clientX, y: event.clientY };
        throttledOnMove({ _id: node.id, ...coordinates });
        throttledPosition(
          reactFlowInstance?.screenToFlowPosition(clientCoords) ?? clientCoords,
        );
      }
    },
    [throttledOnMove, throttledPosition, reactFlowInstance],
  );

  /* onNodeDragStop, we update note */
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
        actionType: 'Do',
        actionId: uuid(),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes],
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
