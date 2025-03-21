import { useRef } from 'react';

import { Button, Modal, useEdificeClient } from '@edifice.io/react';
import { EditorRef } from '@edifice.io/react/editor';
import { QueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs } from 'react-router-dom';
import { NoteContent } from '~/features/Note/components/NoteContent';
import { useAccessStore } from '~/hooks/useAccessStore';
import { noteQueryOptions } from '~/services/queries';
import { checkQueryResult } from '~/utils/checkQueryResult';
import {
  EditionMode,
  authorizedModes,
  useNoteModal,
} from '../../features/Note/hooks/useNoteModal';

export const noteLoader =
  (queryClient: QueryClient) =>
  async ({ request, params }: LoaderFunctionArgs) => {
    const noteQueries = noteQueryOptions(
      params.wallId as string,
      params.noteId as string,
    );

    const mode: EditionMode = new URL(request.url).searchParams.get(
      'mode',
    ) as EditionMode;

    if (!authorizedModes.includes(mode)) {
      throw new Response('', {
        status: 401,
        statusText: `Mode ${mode} is not authorized`,
      });
    }

    const { wallId, noteId } = params;

    if (!wallId || !noteId) {
      throw new Response('', {
        status: 404,
        statusText: 'Wall id or Note id is null',
      });
    }

    const note = await queryClient.ensureQueryData(noteQueries);

    if (!note) {
      throw new Response('', {
        status: 404,
        statusText: 'Not Found',
      });
    }

    return note;
  };

export const Component = () => {
  const editorRef = useRef<EditorRef>(null);

  const {
    editionMode,
    isReadMode,
    isEditMode,
    isCreateMode,
    handleNavigateToEditMode,
    handleSaveNote,
    handleCreateNote,
    handleClose,
    note,
    media,
    query,
    setColorValue,
    setMedia,
    override,
    setIsMediaVisible,
    isMediaVisible,
  } = useNoteModal(editorRef);

  const { hasRightsToUpdateNote } = useAccessStore();

  const { t } = useTranslation();
  const { appCode } = useEdificeClient();
  // check whether query succeed else throw error
  checkQueryResult(query);

  return createPortal(
    <Modal
      id="UpdateNoteModal"
      onModalClose={handleClose}
      size="md"
      isOpen={true}
      focusId=""
      scrollable={true}
    >
      <Modal.Header onModalClose={handleClose}>
        {isReadMode && t('collaborativewall.modal.title.read', { ns: appCode })}
        {isEditMode && t('collaborativewall.modal.title.edit', { ns: appCode })}
        {isCreateMode &&
          t('collaborativewall.modal.title.create', { ns: appCode })}
      </Modal.Header>
      <Modal.Subtitle>
        <span className="text-gray-700 small">{note?.owner?.displayName}</span>
      </Modal.Subtitle>
      <Modal.Body>
        <NoteContent
          ref={editorRef}
          dataNote={note}
          editionMode={editionMode}
          media={media}
          setColorValue={setColorValue}
          setMedia={setMedia}
          setIsMediaVisible={setIsMediaVisible}
          isMediaVisible={isMediaVisible}
        />
        {isEditMode && override && (
          <i className="text-danger">
            {t('collaborativewall.modal.override.detail', { ns: appCode })}
          </i>
        )}
      </Modal.Body>
      <Modal.Footer>
        {isReadMode && note && !hasRightsToUpdateNote(note) && (
          <>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleClose}
            >
              {t('collaborativewall.modal.close', { ns: appCode })}
            </Button>
          </>
        )}
        {isReadMode && note && hasRightsToUpdateNote(note) && (
          <>
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={handleClose}
            >
              {t('collaborativewall.modal.close', { ns: appCode })}
            </Button>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleNavigateToEditMode}
            >
              {t('collaborativewall.modal.modify', { ns: appCode })}
            </Button>
          </>
        )}
        {(isEditMode || isCreateMode) && (
          <Button
            type="button"
            color="tertiary"
            variant="ghost"
            onClick={handleClose}
          >
            {t('collaborativewall.modal.cancel', { ns: appCode })}
          </Button>
        )}
        {isEditMode && (
          <Button
            type="button"
            color={override ? 'danger' : 'primary'}
            variant="filled"
            onClick={handleSaveNote}
          >
            {t(`collaborativewall.modal.${override ? 'override' : 'save'}`, {
              ns: appCode,
            })}
          </Button>
        )}
        {isCreateMode && (
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleCreateNote}
          >
            {t('collaborativewall.modal.add', { ns: appCode })}
          </Button>
        )}
      </Modal.Footer>
    </Modal>,
    document.getElementById('portal') as HTMLElement,
  );
};
