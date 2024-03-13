import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { updateState } from "~/features/history/utils/updateState";
import { useMoveNote } from "~/hooks/useMoveNote";
import { NewState } from "~/models/store";
import { useDeleteNote, useCreateNote } from "~/services/queries";
import { filterData } from "~/services/queries/helpers";
import { useHistoryStore } from "~/store";

export const useHistory = () => {
  const { undo, redo, past, future } = useHistoryStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      past: state.past,
      future: state.future,
    })),
  );

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const deleteNote = useDeleteNote();
  const createNote = useCreateNote();
  const { update } = useMoveNote();

  const queryClient = useQueryClient();

  const deleteAction = async (action: NewState) => {
    await deleteNote.mutateAsync(action.item);
    filterData(queryClient, action);
  };

  const createAction = async (action: NewState) => {
    const response = await createNote.mutateAsync({
      color: action.item.color,
      content: action.item.content,
      idwall: action.item.idwall,
      media: action.item.media,
      x: action.item.x,
      y: action.item.y,
    } as any);

    const { status, wall } = response;

    if (status !== "ok") return;

    const size = wall.length;
    const note = wall[size - 1];

    updateState(action, note);
  };

  const moveAction = async (action: NewState, isUndo: boolean | undefined) => {
    const { positions, item } = action;

    const x = isUndo ? positions?.previous.x ?? 0 : positions?.next.x ?? 0;
    const y = isUndo ? positions?.previous.y ?? 0 : positions?.next.y ?? 0;

    try {
      const updatedNote = await update(item, x, y);
      updateState(action, updatedNote);
    } catch (error) {
      console.error(error);
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
        await moveAction(action, isUndo);
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
