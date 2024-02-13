import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IAction, ID, odeServices } from "edifice-ts-client";

import { getNotes, getWall, sessionHasWorkflowRights } from "../api";
import { workflows } from "~/config";

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

/** Query metadata of a blog */
export const wallQuery = (wallId: string) => {
  return {
    queryKey: ["wall", wallId],
    queryFn: async () => await getWall(wallId),
  };
};

export const notesQuery = (wallId: string) => {
  return {
    queryKey: ["notes", wallId],
    queryFn: async () => await getNotes(wallId),
  };
};

export const useCreateNote = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) =>
      await odeServices.http().post(`/collaborativewall/${id}/note`, data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      note,
    }: {
      id: ID;
      note: {
        content: string;
        x: number;
        y: number;
        idwall: string;
        color: string[];
        modified?: { $date: number };
      };
    }) => {
      const res = await odeServices
        .http()
        .put(`/collaborativewall/${note.idwall}/note/${id}`, note);

      return res;
    },
    /* onMutate: async (variables) => {
      console.log({ variables });
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["notes", variables.note.idwall],
      });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData([
        "notes",
        variables.note.idwall,
      ]);
      const newNote = variables.note;

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["notes", variables.note.idwall],
        variables.note,
      );

      // Return a context with the previous and new note
      return { previousNotes, newNote };
    }, */
    onSettled(data, error, variables, context) {
      console.log({ data, error, variables, context });
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.note.idwall],
      });
    },
  });
};
