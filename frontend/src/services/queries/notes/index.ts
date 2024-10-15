import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ID, odeServices } from 'edifice-ts-client';
import { useParams } from 'react-router-dom';
import { NoteProps, PickedNoteProps } from '~/models/notes';
import { getNote, getNotes, updateNote } from '~/services/api';

export const notesQueryOptions = (wallId: string) =>
  queryOptions({
    queryKey: ['notes', wallId],
    queryFn: async () => getNotes(wallId as string),
  });

export const noteQueryOptions = (wallId: string, noteId: string) =>
  queryOptions({
    queryKey: ['note', wallId, noteId],
    queryFn: async () => getNote(wallId, noteId),
  });

export const useNotes = () => {
  const params = useParams<{ wallId: string }>();
  const query = useQuery(notesQueryOptions(params.wallId!));

  return {
    notes: query.data,
    query,
  };
};

export const useNote = () => {
  const params = useParams<{ wallId: string; noteId: string }>();
  const query = useQuery(noteQueryOptions(params.wallId!, params.noteId!));

  return {
    note: query.data,
    query,
  };
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PickedNoteProps) =>
      await odeServices
        .http()
        .post(`/collaborativewall/${data.idwall}/note`, data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

export const useUpdateNote = () => {
  return useMutation({
    mutationFn: async ({ id, note }: { id: ID; note: PickedNoteProps }) =>
      await updateNote(note.idwall, id, note),
  });
};

export const useDeleteNote = () => {
  return useMutation({
    mutationFn: async (data: NoteProps) => {
      return await odeServices
        .http()
        .delete(
          `/collaborativewall/${data.idwall}/note/${data._id}?lastEdit=${data.modified?.$date}`,
        );
    },
  });
};
