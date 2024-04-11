import { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { notesQueryOptions, wallQueryOptions } from ".";
import { NoteProps } from "~/models/notes";
import { NewState } from "~/models/store";
import { CollaborativeWallProps } from "~/models/wall";

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
          console.log(
            "PREVIOUS:",
            prevNote.x,
            prevNote.y,
            "NEW:",
            note.x,
            note.y,
          );
          return { ...prevNote, ...note, zIndex: 2 };
        }
        return { ...prevNote, zIndex: 1 };
      });
    },
  );
};
export const useUpdateNoteQueryData = () => {
  const queryClient = useQueryClient();
  return (note: Partial<NoteProps> & { wallid: string }) => {
    queryClient.setQueryData(
      notesQueryOptions(note.wallid).queryKey,
      (previousNotes) => {
        return previousNotes?.map((previousNote) => {
          if (previousNote._id === note._id) {
            return { ...previousNote, ...note };
          } else {
            return previousNote;
          }
        });
      },
    );
  };
};
export const useDeleteNoteQueryData = () => {
  const queryClient = useQueryClient();
  return (note: NoteProps) => {
    queryClient.setQueryData(
      notesQueryOptions(note.idwall).queryKey,
      (previousNotes) => {
        return previousNotes?.filter(
          (previousNote) => previousNote._id !== note._id,
        );
      },
    );
  };
};
export const useUpdateWallQueryData = () => {
  const queryClient = useQueryClient();
  return (wall: Partial<CollaborativeWallProps> & { _id: string }) => {
    queryClient.setQueryData(
      wallQueryOptions(wall._id).queryKey,
      (previous) => ({ ...previous, ...wall }) as CollaborativeWallProps,
    );
  };
};
