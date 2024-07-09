import { useQueries, useQueryClient } from "@tanstack/react-query";
import { odeServices } from "edifice-ts-client";

import { NoteProps } from "~/models/notes";
import {
  deleteNoteQueryData,
  notesQueryOptions,
  wallQueryOptions,
} from "~/services/queries";
import { useHistoryStore } from "~/store/history/store";
import { ActionPayload, HttpProvider } from "../../../store/websocket/types";

const REFETCH_INTERVAL = 20000;

export const useHttpMode = (
  enabled: boolean,
  wallId: string | undefined,
): HttpProvider => {
  const queryClient = useQueryClient();

  const { setHistory } = useHistoryStore();
  const { notes, wall } = useQueries({
    queries: [
      {
        ...wallQueryOptions(wallId!),
        refetchInterval: REFETCH_INTERVAL,
        enabled,
      },
      {
        ...notesQueryOptions(wallId!),
        refetchInterval: REFETCH_INTERVAL,
        enabled,
      },
    ],
    combine: ([wall, notes]) => {
      return { wall, notes };
    },
  });

  const refetch = async () => {
    const [_wall, _notes] = await Promise.all([
      wall.refetch(),
      notes.refetch(),
    ]);
    return {
      wall: _wall.data,
      notes: _notes.data,
    };
  };

  const send = async (resourceId: string, payload: ActionPayload) => {
    // set last modified to avoid concurrency error

    const cache = queryClient.getQueryData(
      notesQueryOptions(resourceId).queryKey,
    );

    if (payload.type === "noteUpdated") {
      const oldNote = cache?.find((note) => note._id === payload.noteId);

      if (oldNote?.modified) {
        payload.note.modified = oldNote.modified;
      }

      if (!oldNote) return;

      if (oldNote?.x !== payload.note.x || oldNote?.y !== payload.note.y) {
        // note has been moved
        setHistory({
          type: "move",
          item: {
            ...payload.note,
            content: oldNote.content,
            idwall: oldNote.idwall,
            color: oldNote.color,
            media: oldNote.media,
          },
          previous: {
            x: oldNote.x,
            y: oldNote.y,
          },
          next: {
            x: payload.note.x,
            y: payload.note.y,
          },
          actionId: payload.actionId,
          actionType: payload.actionType,
        });
      } else {
        // note has been updated
        setHistory({
          type: "edit",
          item: {
            ...payload.note,
            content: payload.note.content,
            color: payload.note.color,
            media: payload.note.media,
            idwall: payload.wallId,
          },
          previous: {
            x: oldNote.x,
            y: oldNote.y,
            color: oldNote.color,
            content: oldNote.content,
            media: oldNote.media || null,
          },
          next: {
            x: payload.note.x,
            y: payload.note.y,
            color: payload.note.color,
            content: payload.note.content,
            media: payload.note.media || null,
          },
          actionId: payload.actionId,
          actionType: payload.actionType,
        });
      }
    }

    if (payload.type === "noteDeleted") {
      const note = cache?.find((note) => note._id === payload.noteId);

      if (note) {
        setHistory({
          type: "delete",
          item: note,
          actionId: payload.actionId,
          actionType: payload.actionType,
        });
        deleteNoteQueryData(queryClient, note);
      }
    }
    // send payload
    await odeServices
      .http()
      .putJson(`/collaborativewall/${resourceId}/event`, payload);

    // refresh
    const result = await refetch();

    if (payload.type === "noteAdded") {
      const notesArray = result.notes;

      if (!notesArray) return;

      const newNote = notesArray[notesArray.length - 1];

      setHistory({
        type: "create",
        item: newNote,
        actionId: payload.actionId,
        actionType: payload.actionType,
      });

      queryClient.setQueryData(
        notesQueryOptions(payload?.wallId as string).queryKey,
        (previousNotes: NoteProps[] | undefined) => {
          return previousNotes && [...previousNotes, newNote];
        },
      );
    }
  };
  return { refetch, send };
};
