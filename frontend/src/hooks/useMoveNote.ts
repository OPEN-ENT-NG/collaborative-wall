import { Active } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";

import { NoteMedia } from "~/models/noteMedia";
import { NoteProps } from "~/models/notes";
import { updateNote } from "~/services/api";
import { notesQueryOptions } from "~/services/queries";
import { useHistoryStore, useWhiteboard } from "~/store";

export const useMoveNote = (notes: NoteProps[]) => {
  const queryClient = useQueryClient();

  const zoom = useWhiteboard((state) => state.zoom);

  const { setUpdatedNote, setHistory } = useHistoryStore();

  const moveNote = async ({
    active,
    delta,
  }: {
    active: Active;
    delta: { x: number; y: number };
  }) => {
    const activeId = active.id as string;
    const findNote = notes?.find((note) => note._id === activeId);

    if (!findNote) return;

    const { idwall: wallId, _id: noteId } = findNote;

    const position = {
      x: Math.round(findNote.x + delta.x / zoom),
      y: Math.round(findNote.y + delta.y / zoom),
    };

    const note: {
      content: string;
      x: number;
      y: number;
      idwall: string;
      color: string[];
      media: NoteMedia | null;
      modified?: { $date: number };
    } = {
      content: findNote.content,
      color: findNote.color,
      idwall: wallId,
      media: findNote.media,
      modified: findNote.modified,
      x: position.x,
      y: position.y,
    };

    setUpdatedNote({
      activeId,
      x: position.x,
      y: position.y,
      zIndex: 2,
    });

    const response = await updateNote(wallId, noteId, note);

    const { status, wall: updatedWall } = response;

    if (status === "ok") {
      const updatedNote = updatedWall.find(
        (item: NoteProps) => item._id === noteId,
      );

      setHistory({
        type: "move",
        item: updatedNote,
        positions: {
          previous: {
            x: findNote.x,
            y: findNote.y,
          },
          next: {
            x: position.x,
            y: position.y,
          },
        },
      });

      queryClient.setQueryData(
        notesQueryOptions(wallId).queryKey,
        (previousNotes: NoteProps[] | undefined) => {
          return previousNotes?.map((prevNote) => {
            if (prevNote._id === noteId) {
              return { ...prevNote, ...updatedNote, zIndex: 2 };
            }
            return { ...prevNote, zIndex: 1 };
          });
        },
      );
    }
  };

  return moveNote;
};
