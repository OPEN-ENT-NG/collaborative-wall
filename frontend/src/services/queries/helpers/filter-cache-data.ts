import { QueryClient } from "@tanstack/react-query";
import { NewState } from "~/store/history/types";
import { notesQueryOptions } from "..";

export const filterData = (queryClient: QueryClient, action: NewState) => {
  return queryClient.setQueryData(
    notesQueryOptions(action.item.idwall).queryKey,
    (previousNotes) => {
      return previousNotes?.filter(
        (previousNote) => previousNote._id !== action.item._id,
      );
    },
  );
};
