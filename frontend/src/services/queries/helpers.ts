import { QueryClient } from "@tanstack/react-query";

import { notesQueryOptions } from ".";
import { NoteProps } from "~/models/notes";
import { NewState } from "~/models/store";

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

export const updateData = (queryClient: QueryClient, note: NoteProps) => {
  return queryClient.setQueryData(
    notesQueryOptions(note.idwall).queryKey,
    (previousNotes: NoteProps[] | undefined) => {
      return previousNotes?.map((prevNote) => {
        if (prevNote._id === note._id) {
          return { ...prevNote, ...note, zIndex: 2 };
        }
        return { ...prevNote, zIndex: 1 };
      });
    },
  );
};
