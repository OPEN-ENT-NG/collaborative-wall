import { RefObject, useCallback, useEffect, useState } from 'react';

import { useEdificeClient, useUser } from '@edifice.io/react';
import { EditorRef } from '@edifice.io/react/editor';
import { useTranslation } from 'react-i18next';
import {
  useBeforeUnload,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { v4 as uuid } from 'uuid';

import { useShallow } from 'zustand/react/shallow';
import { useInvalidateNoteQueries } from '~/hooks/useInvalidateNoteQueries';
import { MediaProps } from '~/models/media';
import { NoteProps, PickedNoteProps } from '~/models/notes';
import { useWebsocketStore, useWhiteboardStore } from '~/store';
import { useNote } from '~/services/queries';
import { noteColors } from '~/config';

export type EditionMode = 'read' | 'edit' | 'create';
export const authorizedModes: EditionMode[] = ['read', 'edit', 'create'];

/**  Outside function to handle random position
 * Defined outside the hook so that this method is recreated on each render
 */
const randomPosition = () => {
  const min = -100;
  const max = 100;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const useNoteModal = (editorRef: RefObject<EditorRef>) => {
  /* Search params for read | edit mode */
  const [searchParams] = useSearchParams();
  // Get mode from query params
  const editionMode: EditionMode =
    (searchParams.get('mode') as EditionMode) || 'create';
  // Get notes from query params
  const { note: loadedNote, query } = useNote();
  // Define state for colorValue
  const [override, setOverride] = useState<boolean>(false);
  // Define state for colorValue
  const [colorValue, setColorValue] = useState<string[]>(
    loadedNote?.color || [noteColors.yellow.background],
  );
  const [isMediaVisible, setIsMediaVisible] = useState<boolean>(
    loadedNote?.isMediaVisible ?? false,
  );
  // Define state for media
  const [media, setMedia] = useState<MediaProps | null>(
    loadedNote?.media ?? null,
  );
  // Define state for note
  const [note, setNote] = useState<NoteProps | undefined>(loadedNote);
  // Get current user
  const { user } = useUser();
  // Update media when note changed
  useEffect(() => {
    // If we are in edit mode and the note is already loaded, do nothing
    if (
      editionMode === 'edit' &&
      loadedNote?._id &&
      note?._id &&
      loadedNote._id === note._id
    ) {
      return;
    }
    // set the media
    if (loadedNote) {
      setMedia(loadedNote?.media);
    }
  }, [loadedNote, note, editionMode]);
  // Update note when note changed
  useEffect(() => {
    // If we are in edit mode and the note is already loaded, do nothing
    if (
      editionMode === 'edit' &&
      loadedNote?._id &&
      note?._id &&
      loadedNote._id === note._id
    ) {
      return;
    }
    // set the note
    setNote(loadedNote);
  }, [loadedNote, note, editionMode]);

  // Define mode
  const isReadMode = editionMode === 'read';
  const isEditMode = editionMode === 'edit';
  const isCreateMode = editionMode === 'create';

  /* Invalidate Notes Queries after mutation */
  const invalidateNoteQueries = useInvalidateNoteQueries();

  /* React Router useNavigate */
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { appCode } = useEdificeClient();

  /* Get wall id based on frontend route */
  const { wallId } = useParams();

  /* Websocket methods to perform mutations */
  const { sendNoteAddedEvent, sendNoteUpdated, subscribe } =
    useWebsocketStore();

  // Subscribe to websocket events
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (
        event.type === 'noteUpdated' &&
        event.note._id === loadedNote?._id &&
        event.userId !== user?.userId
      ) {
        setOverride(true);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [loadedNote, subscribe, user]);

  /** Get positionViewport from whiteboard store */
  const { positionViewport } = useWhiteboardStore(
    useShallow((state) => ({
      positionViewport: state.positionViewport,
    })),
  );

  /** Function to handle confirmed modal when use leaves page or closes modal */
  const isDirty = useCallback(() => {
    return (
      loadedNote?.color?.[0] != colorValue[0] ||
      loadedNote.content != (editorRef.current?.getContent('html') as string) ||
      loadedNote.media?.id != media?.id
    );
  }, [loadedNote, colorValue, editorRef, media]);

  useBeforeUnload((event) => {
    if (isCreateMode || (isEditMode && isDirty())) {
      event.preventDefault();
    }
  });

  const navigateBack = () => navigate('..');

  const handleCreateNote = async () => {
    if (!wallId) {
      throw Error('Wall id is undefined');
    }

    const note: PickedNoteProps = {
      content: editorRef.current?.getContent('html') as string,
      color: colorValue,
      isMediaVisible: isMediaVisible,
      idwall: wallId,
      media: media,
      x: Math.trunc(
        positionViewport.x * -1 +
          window.innerWidth / 2 -
          100 +
          randomPosition(),
      ),
      y: Math.trunc(
        positionViewport.y * -1 +
          window.innerHeight / 2 -
          150 +
          randomPosition(),
      ),
    };

    try {
      await sendNoteAddedEvent({
        ...note,
        actionType: 'Do',
        actionId: uuid(),
      });
      await invalidateNoteQueries();
      navigateBack();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveNote = async () => {
    if (!loadedNote) return;

    const note: PickedNoteProps = {
      content: editorRef.current?.getContent('html') as string,
      color: colorValue,
      isMediaVisible: isMediaVisible,
      idwall: loadedNote?.idwall as string,
      media: media || null,
      modified: loadedNote?.modified,
      x: loadedNote?.x,
      y: loadedNote?.y,
    };
    await sendNoteUpdated({
      _id: loadedNote?._id,
      content: note.content,
      media: note.media,
      color: note.color,
      isMediaVisible: note.isMediaVisible,
      x: note.x,
      y: note.y,
      actionType: 'Do',
      actionId: uuid(),
    });

    await invalidateNoteQueries();

    navigateBack();
  };

  const handleClose = () => {
    if (isCreateMode || (isEditMode && isDirty())) {
      const res: boolean = window.confirm(
        t('collaborativewall.modal.note.confirm.close', { ns: appCode }),
      );
      if (res) {
        navigateBack();
      }
    } else {
      navigateBack();
    }
  };

  const handleNavigateToEditMode = () => {
    if (!loadedNote) return;

    navigate(`../note/${loadedNote._id}?mode=edit`);
  };

  return {
    query,
    media,
    setMedia,
    colorValue,
    setColorValue,
    isMediaVisible,
    setIsMediaVisible,
    editionMode,
    isReadMode,
    isEditMode,
    isCreateMode,
    note,
    setNote,
    override,
    handleNavigateToEditMode,
    handleCreateNote,
    handleSaveNote,
    handleClose,
  };
};
