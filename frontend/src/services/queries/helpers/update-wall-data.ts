import { QueryClient } from "@tanstack/react-query";
import { CollaborativeWallProps } from "~/models/wall";
import { wallQueryOptions } from "..";

export const updateWallQueryData = (
  queryClient: QueryClient,
  wall: Partial<CollaborativeWallProps> & { _id: string },
) => {
  return queryClient.setQueryData(
    wallQueryOptions(wall._id).queryKey,
    (previous) => ({ ...previous, ...wall }) as CollaborativeWallProps,
  );
};
