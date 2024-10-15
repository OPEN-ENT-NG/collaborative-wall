import { QueryClient } from '@tanstack/react-query';
import { NoteProps } from '~/models/notes';
import { notesQueryOptions } from '../notes';

export const updateNoteQueryData = (
  queryClient: QueryClient,
  note: Partial<NoteProps> & { wallid: string },
) => {
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
