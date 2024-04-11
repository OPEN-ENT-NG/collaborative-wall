import { useOdeClient, useToast } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { NewState } from "~/models/store";
import { filterData } from "~/services/queries/helpers";
import { useHistoryStore, useWebsocketStore } from "~/store";

const MAX_HISTORY = 40;

export const useHistory = () => {
  const { undo, redo, past, future } = useHistoryStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      past: state.past,
      future: state.future,
    })),
  );

  const { t } = useTranslation();

  const { appCode } = useOdeClient();

  const canUndo = past.length > 0 && past.length < MAX_HISTORY;
  const canRedo = future.length > 0 && future.length < MAX_HISTORY;

  const toast = useToast();
  const { sendNoteUpdated, sendNoteDeletedEvent, sendNoteAddedEvent } =
    useWebsocketStore(
      useShallow((state) => ({
        sendNoteAddedEvent: state.sendNoteAddedEvent,
        sendNoteDeletedEvent: state.sendNoteDeletedEvent,
        sendNoteUpdated: state.sendNoteUpdated,
      })),
    );

  const queryClient = useQueryClient();

  const deleteAction = async (action: NewState) => {
    sendNoteDeletedEvent(action.item._id);
    filterData(queryClient, action);
  };

  const createAction = async (action: NewState) => {
    sendNoteAddedEvent({
      color: action.item.color,
      content: action.item.content,
      idwall: action.item.idwall,
      media: action.item.media,
      x: action.item.x,
      y: action.item.y,
    });
  };

  const moveAction = async (action: NewState, isUndo: boolean) => {
    const { previous, next, item } = action;

    const x = isUndo ? previous?.x ?? 0 : next?.x ?? 0;
    const y = isUndo ? previous?.y ?? 0 : next?.y ?? 0;

    try {
      await sendNoteUpdated({
        _id: item._id,
        content: item.content,
        color: item.color,
        media: item.media,
        x,
        y,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const editAction = async (action: NewState, isUndo: boolean) => {
    const { previous, next, item } = action;

    const color = isUndo
      ? previous?.color ?? item.color
      : next?.color ?? item.color;
    const content = isUndo
      ? previous?.content ?? item.content
      : next?.content ?? item.content;
    const media = isUndo ? previous?.media || null : next?.media || null;
    const x = isUndo ? previous?.x ?? item.x : next?.x ?? item.x;
    const y = isUndo ? previous?.y ?? item.y : next?.y ?? item.y;

    try {
      sendNoteUpdated({
        _id: item._id,
        content,
        color,
        media,
        x,
        y,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const executeAction = async (action: NewState, isUndo: boolean) => {
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
      case "edit": {
        await editAction(action, isUndo);
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
    toast.success(t("collaborativewall.toast.undo", { ns: appCode }));
  };

  const handleRedo = async () => {
    redo();

    const nextAction = future[0];

    executeAction(nextAction, false);
    toast.success(t("collaborativewall.toast.redo", { ns: appCode }));
  };

  return {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
  };
};
