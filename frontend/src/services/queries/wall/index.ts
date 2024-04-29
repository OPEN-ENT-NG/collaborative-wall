import {
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ID } from "edifice-ts-client";
import { useParams } from "react-router-dom";
import { PickedCollaborativeWallProps } from "~/models/wall";
import { loadWall, updateWall } from "~/services/api";
import { notesQueryOptions } from "../notes";

export const wallQueryOptions = (wallId: string) =>
  queryOptions({
    queryKey: ["wall", wallId],
    queryFn: () => loadWall(wallId),
  });

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
