import { Active } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { NoteProps } from "~/models/notes";
import { notesQueryOptions, useUpdateNote } from "~/services/queries";
import { updateData } from "~/services/queries/helpers";
import { useHistoryStore, useWhiteboard } from "~/store";

export const useEditNote = ({
  onClick,
}: {
  onClick?: (id: string) => void;
}) => {
  const { wallId } = useParams();
  const { setUpdatedNote, setHistory } = useHistoryStore();

  const queryClient = useQueryClient();
  const { zoom, toggleCanMoveBoard } = useWhiteboard(
    useShallow((state) => ({
      zoom: state.zoom,
      toggleCanMoveBoard: state.toggleCanMoveBoard,
    })),
  );
  const updateNote = useUpdateNote();

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
    }

    setUpdatedNote({
      activeId: findNote._id,
      x: position.x,
      y: position.y,
      zIndex: 2,
    });

    await updateNote.mutateAsync(
      {
        id: findNote._id,
        note: {
          content: findNote.content,
          color: findNote.color,
          idwall: findNote.idwall,
          media: findNote.media,
          modified: findNote.modified,
          x: position.x,
          y: position.y,
        },
      },
      {
        onSuccess: async (data, { id }) => {
          const { status, wall: notes } = data;

          if (status !== "ok") return;

          const updatedNote = notes.find((note: NoteProps) => note._id === id);

          updateData(queryClient, updatedNote);

          setHistory({
            type: "move",
            item: updatedNote,
            previous: {
              x: previous.x,
              y: previous.y,
            },
            next: {
              x: position.x,
              y: position.y,
            },
          });
        },
      },
    );
  };

  return { handleOnDragEnd, handleOnDragStart };
};
