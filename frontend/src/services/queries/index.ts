import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { IAction, ID, odeServices } from "edifice-ts-client";

import { useParams } from "react-router-dom";
import { workflows } from "~/config";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { PickedCollaborativeWallProps } from "~/models/wall";
import {
  getNote,
  getNotes,
  loadWall,
  sessionHasWorkflowRights,
  updateNote,
  updateWall,
} from "../api";

export const wallQueryOptions = (wallId: string) =>
  queryOptions({
    queryKey: ["wall", wallId],
    queryFn: () => loadWall(wallId),
  });

export const notesQueryOptions = (wallId: string) =>
  queryOptions({
    queryKey: ["notes", wallId],
    queryFn: async () => getNotes(wallId as string),
  });

export const noteQueryOptions = (wallId: string, noteId: string) =>
  queryOptions({
    queryKey: ["note", wallId, noteId],
    queryFn: async () => getNote(wallId, noteId),
  });

export const useActions = () => {
  const { view, list } = workflows;

  return useQuery<Record<string, boolean>, Error, IAction[]>({
    queryKey: ["actions"],
    queryFn: async () => {
      const availableRights = await sessionHasWorkflowRights([view, list]);
      return availableRights;
    },
    select: (data) => {
      const actions: any[] = [
        {
          id: "view",
          workflow: view,
        },
        {
          id: "list",
          workflow: list,
        },
      ];
      return actions.map((action) => ({
        ...action,
        available: data[action.workflow],
      }));
    },
  });
};

export const useWall = () => {
  const params = useParams<{ wallId: string }>();
  const query = useQuery(wallQueryOptions(params.wallId!));

  return {
    wall: query.data,
    query,
  };
};

export const useUpdateWall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      wallId,
      newWall,
    }: {
      wallId: ID;
      newWall: PickedCollaborativeWallProps;
    }) => await updateWall(wallId as string, newWall),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["wall"] });
    },
  });
};

export const useNotes = () => {
  const params = useParams<{ wallId: string }>();
  const query = useQuery(notesQueryOptions(params.wallId!));

  return {
    notes: query.data,
    query,
  };
};

export const useNote = () => {
  const params = useParams<{ wallId: string; noteId: string }>();
  const query = useQuery(noteQueryOptions(params.wallId!, params.noteId!));

  return {
    note: query.data as NoteProps,
    query,
  };
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PickedNoteProps) =>
      await odeServices
        .http()
        .post(`/collaborativewall/${data.idwall}/note`, data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};

export const useWallWithNotes = (wallId: string) => {
  return useQueries({
    queries: [
      {
        queryKey: wallQueryOptions(wallId).queryKey,
        queryFn: wallQueryOptions(wallId).queryFn,
      },
      {
        queryKey: notesQueryOptions(wallId).queryKey,
        queryFn: notesQueryOptions(wallId).queryFn,
      },
    ],
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
        loading: results.some((result) => result.isLoading),
        error: results.some((result) => result.isError),
      };
    },
  });
};

export const useUpdateNote = () => {
  return useMutation({
    mutationFn: async ({ id, note }: { id: ID; note: PickedNoteProps }) =>
      await updateNote(note.idwall, id, note),
  });
};

export const useDeleteNote = () => {
  return useMutation({
    mutationFn: async (data: NoteProps) => {
      return await odeServices
        .http()
        .delete(
          `/collaborativewall/${data.idwall}/note/${data._id}?lastEdit=${data.modified?.$date}`,
        );
    },
  });
};
