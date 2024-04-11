import { Active } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { notesQueryOptions } from "~/services/queries";
import { useHistoryStore, useWebsocketStore, useWhiteboard } from "~/store";
import { uuid } from "~/utils/uuid";

export const useEditNote = ({
  onClick,
}: {
  onClick?: (id: string) => void;
}) => {
  const { wallId } = useParams();
  const { setUpdatedNote } = useHistoryStore();
  const { sendNoteUpdated } = useWebsocketStore(
    useShallow((state) => ({
      sendNoteUpdated: state.sendNoteUpdated,
    })),
  );
  const queryClient = useQueryClient();
  const { zoom, toggleCanMoveBoard } = useWhiteboard(
    useShallow((state) => ({
      zoom: state.zoom,
      toggleCanMoveBoard: state.toggleCanMoveBoard,
    })),
  );

  const handleOnDragStart = () => {
    toggleCanMoveBoard();
  };

  const handleOnDragEnd = async ({
    active,
    delta,
  }: {
    active: Active;
    delta: { x: number; y: number };
  }) => {
    toggleCanMoveBoard();
    const queryNotes = notesQueryOptions(wallId as string);

    const notes =
      queryClient.getQueryData(queryNotes.queryKey) ??
      (await queryClient.fetchQuery(queryNotes));

    const activeId = active.id as string;
    const findNote = notes?.find((note) => note._id === activeId);

    if (!findNote) return;

    const previous = {
      x: findNote.x,
      y: findNote.y,
    };

    const position = {
      x: Math.round(findNote.x + delta.x / zoom),
      y: Math.round(findNote.y + delta.y / zoom),
    };

    if (previous.x === position.x && previous.y === position.y) {
      onClick?.(findNote._id);
    } else {
      setUpdatedNote({
        activeId: findNote._id,
        x: position.x,
        y: position.y,
        zIndex: 2,
      });
      sendNoteUpdated({
        ...findNote,
        ...position,
        actionType: "Do",
        actionId: uuid(),
      });
    }
  };

  return { handleOnDragEnd, handleOnDragStart };
};
