import { useQueries } from "@tanstack/react-query";
import { odeServices } from "edifice-ts-client";

import { ActionPayload, HttpProvider } from "./types";
import { wallQueryOptions, notesQueryOptions } from "~/services/queries";

const REFETCH_INTERVAL = 20000;

export const useHttpMode = (
  enabled: boolean,
  wallId: string | undefined,
): HttpProvider => {
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
    if (payload.type === "noteUpdated") {
      const found = (notes.data ?? []).find((n) => n._id === payload.noteId);
      if (found?.modified) {
        payload.note.modified = found.modified;
      }
    }
    // send payload
    await odeServices
      .http()
      .putJson(`/collaborativewall/${resourceId}/event`, payload);
    // refresh
    await refetch();
  };
  return { refetch, send };
};
