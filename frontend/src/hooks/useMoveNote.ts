import { useState } from "react";

import { Active } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";

import { NoteMedia } from "~/models/noteMedia";
import { NoteProps } from "~/models/notes";
import { updateNote } from "~/services/api";
import { notesQueryOptions } from "~/services/queries";

export const useMoveNote = ({
  zoom,
  notes,
}: {
  zoom: number;
  notes: NoteProps[] | undefined;
}) => {
  const queryClient = useQueryClient();

  const [updatedNote, setUpdatedNote] = useState<
    | {
        activeId: string;
        x: number;
        y: number;
        zIndex: number;
      }
    | undefined
  >(undefined);

  const handleOnDragEnd = async ({
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
      x: Math.round(findNote.x + delta.x / zoom),
      y: Math.round(findNote.y + delta.y / zoom),
    };

    console.log(note);

    setUpdatedNote({
      activeId,
      x: Math.round(findNote.x + delta.x / zoom),
      y: Math.round(findNote.y + delta.y / zoom),
      zIndex: 2,
    });

    await updateNote(wallId, noteId, note);

    queryClient.setQueryData(
      notesQueryOptions(wallId).queryKey,
      (previousNotes: NoteProps[] | undefined) => {
        return previousNotes?.map((prevNote) => {
          if (prevNote._id === noteId) {
            return { ...prevNote, ...note, zIndex: 2 };
          }
          return { ...prevNote, zIndex: 1 };
        });
      },
    );
  };

  return { updatedNote, handleOnDragEnd };
};
