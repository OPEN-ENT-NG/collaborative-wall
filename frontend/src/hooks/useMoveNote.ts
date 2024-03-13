import { Active } from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";

import { NoteMedia } from "~/models/noteMedia";
import { NoteProps } from "~/models/notes";
import { updateNote } from "~/services/api";
import { updateData } from "~/services/queries/helpers";
import { useHistoryStore, useWhiteboard } from "~/store";

export const useMoveNote = () => {
  const queryClient = useQueryClient();

  const zoom = useWhiteboard((state) => state.zoom);

  const { setUpdatedNote, setHistory } = useHistoryStore();

  const update = async (currentNote: NoteProps, x: number, y: number) => {
    const note: {
      content: string;
      x: number;
      y: number;
      idwall: string;
      color: string[];
      media: NoteMedia | null;
      modified?: { $date: number };
    } = {
      content: currentNote.content,
      color: currentNote.color,
      idwall: currentNote.idwall,
      media: currentNote.media,
      modified: currentNote.modified,
      x,
      y,
    };

    const response = await updateNote(
      currentNote.idwall,
      currentNote._id,
      note,
    );

    const { status, wall: updatedWall } = response;

    if (status !== "ok") return;

    const updatedNote = updatedWall.find(
      (item: NoteProps) => item._id === currentNote._id,
    );

    updateData(queryClient, updatedNote);

    setUpdatedNote({
      activeId: currentNote._id,
      x,
      y,
      zIndex: 2,
    });

    return updatedNote;
  };

  const move =
    (notes?: NoteProps[]) =>
    async ({
      active,
      delta,
    }: {
      active: Active;
      delta: { x: number; y: number };
    }) => {
      const activeId = active.id as string;
      const findNote = notes?.find((note) => note._id === activeId);

      if (!findNote) return;

      const position = {
        x: Math.round(findNote.x + delta.x / zoom),
        y: Math.round(findNote.y + delta.y / zoom),
      };

      const updatedNote = await update(findNote, position.x, position.y);

      if (!updatedNote) return;

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
    };

  return { update, move };
};
