import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { NoteProps } from "~/models/notes";
import {
  useDeleteNote,
  notesQueryOptions,
  useCreateNote,
} from "~/services/queries";
import { NewState, useHistoryStore } from "~/store/history.store";

const updateActionState = (
  states: NewState[],
  action: NewState,
  item: NoteProps,
) => {
  return states.map((state) => {
    if (state.item._id === action.item._id) {
      return {
        ...state,
        item: {
          ...state.item,
          modified: {
            $date: item.modified?.$date as number,
          },
          _id: item._id,
        },
      };
    }
    return state;
  });
};

const updatePresentState = (
  state: NewState | null,
  action: NewState,
  item: NoteProps,
) => {
  if (!state) return;

  if (state.item._id === action.item._id) {
    return {
      ...state,
      item: {
        ...state.item,
        modified: {
          $date: item.modified?.$date as number,
        },
        _id: item._id,
      },
    };
  }
  return state;
};

export const useHistory = () => {
  const { undo, redo, past, future, setUpdatedNote } = useHistoryStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      past: state.past,
      future: state.future,
      setUpdatedNote: state.setUpdatedNote,
    })),
  );

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const deleteNote = useDeleteNote();
  const createItem = useCreateNote();
  const queryClient = useQueryClient();

  const deleteAction = async (action: NewState) => {
    // TODO
    await deleteNote.mutateAsync(action.item);

    queryClient.setQueryData(
      notesQueryOptions(action.item.idwall).queryKey,
      (previousNotes) => {
        return previousNotes?.filter(
          (previousNote) => previousNote._id !== action.item._id,
        );
      },
    );

    // removeItems(action.item._id);
  };

  const createAction = async (action: NewState) => {
    const response = await createItem.mutateAsync({
      color: action.item.color,
      content: action.item.content,
      idwall: action.item.idwall,
      x: action.item.x,
      y: action.item.y,
    } as any);

    const { status, wall } = response;

    if (status === "ok") {
      const size = wall.length;
      const note = wall[size - 1];

      if (!note) return;

      useHistoryStore.setState((state) => {
        return {
          ...state,
          past: updateActionState(state.past, action, note),
          present: updatePresentState(state.present, action, note),
          future: updateActionState(state.future, action, note),
        };
      });
    }
  };

  const executeAction = async (action: NewState, isUndo?: boolean) => {
    switch (action.type) {
      case "create":
        isUndo ? await deleteAction(action) : await createAction(action);
        break;
      case "delete":
        isUndo ? await createAction(action) : await deleteAction(action);
        break;
      case "move": {
        const { positions, item } = action;

        const x = isUndo ? positions?.previous.x ?? 0 : positions?.next.x ?? 0;
        const y = isUndo ? positions?.previous.y ?? 0 : positions?.next.y ?? 0;

        if (item) {
          setUpdatedNote({
            activeId: item._id,
            x,
            y,
            zIndex: 2,
          });
          // updateItems(item, x, y);
        }
        break;
      }
      default:
        console.log(`Unhandled action type: ${action.type}`);
    }
  };

  const handleUndo = async () => {
    undo();

    const lastAction = past[past.length - 1];

    executeAction(lastAction, true);
  };

  const handleRedo = async () => {
    redo();

    const nextAction = future[0];

    executeAction(nextAction, false);
  };

  return {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
  };
};
