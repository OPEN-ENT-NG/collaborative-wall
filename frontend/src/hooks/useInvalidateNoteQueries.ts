import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { noteQueryOptions, notesQueryOptions } from '../services/queries';

export const useInvalidateNoteQueries = () => {
  const params = useParams();
  const queryClient = useQueryClient();

  const noteQueries = noteQueryOptions(
    params.wallId as string,
    params.noteId as string,
  );

  const notesQueries = notesQueryOptions(params.wallId as string);

  const invalidateNoteQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: noteQueries.queryKey,
    });
    await queryClient.invalidateQueries({
      queryKey: notesQueries.queryKey,
    });
  };

  return invalidateNoteQueries;
};
