import { QueryClient } from '@tanstack/react-query';
import { NoteProps } from '~/models/notes';
import { notesQueryOptions } from '../notes';

export const deleteNoteQueryData = (
  queryClient: QueryClient,
  note: NoteProps,
) => {
  queryClient.setQueryData(
    notesQueryOptions(note.idwall).queryKey,
    (previousNotes) => {
      return previousNotes?.filter(
        (previousNote) => previousNote._id !== note._id,
      );
    },
  );
};
