import { QueryClient } from '@tanstack/react-query';
import { NoteProps } from '~/models/notes';
import { noteQueryOptions, notesQueryOptions } from '..';

export const updateData = (queryClient: QueryClient, note: NoteProps) => {
  // update individual note
  queryClient.setQueryData(
    noteQueryOptions(note.idwall, note._id).queryKey,
    () => note,
  );
  // update list notes
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
