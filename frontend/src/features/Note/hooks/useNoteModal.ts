import { RefObject, useCallback } from 'react';

import { useEdificeClient } from '@edifice.io/react';
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

export const useNoteModal = (
  editorRef: RefObject<EditorRef>,
  colorValue: string[],
  loadedData: NoteProps | undefined,
  media: MediaProps | null,
) => {
  /* Search params for read | edit mode */
  const [searchParams] = useSearchParams();

  const editionMode: EditionMode =
    (searchParams.get('mode') as EditionMode) || 'create';

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
  const { sendNoteAddedEvent, sendNoteUpdated } = useWebsocketStore();

  const { positionViewport } = useWhiteboardStore(
    useShallow((state) => ({
      positionViewport: state.positionViewport,
    })),
  );

  /** Function to handle confirmed modal when use leaves page or closes modal */
  const isDirty = useCallback(() => {
    return (
      loadedData?.color?.[0] != colorValue[0] ||
      loadedData.content != (editorRef.current?.getContent('html') as string) ||
      loadedData.media?.id != media?.id
    );
  }, [loadedData, colorValue, editorRef, media]);

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
    if (!loadedData) return;

    const note: PickedNoteProps = {
      content: editorRef.current?.getContent('html') as string,
      color: colorValue,
      idwall: loadedData?.idwall as string,
      media: media || null,
      modified: loadedData?.modified,
      x: loadedData?.x,
      y: loadedData?.y,
    };
    await sendNoteUpdated({
      _id: loadedData?._id,
      content: note.content,
      media: note.media,
      color: note.color,
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
    if (!loadedData) return;

    navigate(`../note/${loadedData._id}?mode=edit`);
  };

  return {
    editionMode,
    isReadMode,
    isEditMode,
    isCreateMode,
    handleNavigateToEditMode,
    handleCreateNote,
    handleSaveNote,
    handleClose,
  };
};
