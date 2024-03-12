import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { IAction, ID, odeServices } from "edifice-ts-client";

import {
  getNote,
  getNotes,
  getWall,
  sessionHasWorkflowRights,
  updateNote,
  updateWall,
} from "../api";
import { workflows } from "~/config";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { PickedCollaborativeWallProps } from "~/models/wall";

export const wallQueryOptions = (wallId: string) =>
  queryOptions({
    queryKey: ["wall", wallId],
    queryFn: async () => await getWall(wallId),
  });

export const notesQueryOptions = (wallId: string) =>
  queryOptions({
    queryKey: ["notes", wallId],
    queryFn: async () => await getNotes(wallId as string),
  });

export const noteQueryOptions = (wallId: string, noteId: string) =>
  queryOptions({
    queryKey: ["note", wallId, noteId],
    queryFn: async () => await getNote(wallId, noteId),
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

export const useGetWall = (wallId: string) => {
  return useQuery(wallQueryOptions(wallId));
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

export const useGetNotes = (wallId: string) => {
  return useQuery(notesQueryOptions(wallId));
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

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: ID; note: PickedNoteProps }) =>
      await updateNote(note.idwall as string, id, note),
    onSuccess: async (_, { id, note }) => {
      const previousNotes = queryClient.getQueryData(["notes", note.idwall]);

      if (previousNotes) {
        queryClient.setQueryData(
          notesQueryOptions(note.idwall as string).queryKey,
          (oldNotes: NoteProps[] | undefined) => {
            return oldNotes?.map((oldNote) => {
              if (oldNote._id === id) {
                return { ...oldNote, ...note, zIndex: 2 };
              }
              return { ...oldNote, zIndex: 1 };
            });
          },
        );
      }
    },
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
