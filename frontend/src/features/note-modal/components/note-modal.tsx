import { useEffect, useRef, useState } from "react";

import { EditorRef } from "@edifice-ui/editor";
import { Button, Modal, useOdeClient } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs } from "react-router-dom";

import { QueryClient } from "@tanstack/react-query";
import { noteColors } from "~/config";
import { useAccess } from "~/hooks/use-access";
import { NoteMedia } from "~/models/note-media";
import { noteQueryOptions, useNote } from "~/services/queries";
import {
  EditionMode,
  authorizedModes,
  useNoteModal,
} from "../hooks/use-note-modal";
import { NoteContent } from "./note-content";

export const noteLoader =
  (queryClient: QueryClient) =>
  async ({ request, params }: LoaderFunctionArgs) => {
    const noteQueries = noteQueryOptions(
      params.wallId as string,
      params.noteId as string,
    );

    const mode: EditionMode = new URL(request.url).searchParams.get(
      "mode",
    ) as EditionMode;

    if (!authorizedModes.includes(mode)) {
      throw new Response("", {
        status: 401,
        statusText: `Mode ${mode} is not authorized`,
      });
    }

    const { wallId, noteId } = params;

    if (!wallId || !noteId) {
      throw new Response("", {
        status: 404,
        statusText: "Wall id or Note id is null",
      });
    }

    const note = await queryClient.fetchQuery(noteQueries);

    if (!note) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }

    return note;
  };

export const NoteModal = () => {
  const { note } = useNote();

  const [colorValue, setColorValue] = useState<string[]>(
    note?.color || [noteColors.yellow.background],
  );
  const [media, setMedia] = useState<NoteMedia | null>(note?.media);
  useEffect(() => {
    setMedia(note?.media);
  }, [note?.media]);

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
  } = useNoteModal(editorRef, colorValue, note, media);

  const { hasRightsToUpdateNote } = useAccess();

  const { t } = useTranslation();
  const { appCode } = useOdeClient();
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
        {isReadMode && t("collaborativewall.modal.title.read", { ns: appCode })}
        {isEditMode && t("collaborativewall.modal.title.edit", { ns: appCode })}
        {isCreateMode &&
          t("collaborativewall.modal.title.create", { ns: appCode })}
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
        />
      </Modal.Body>
      <Modal.Footer>
        {isReadMode && !hasRightsToUpdateNote(note) && (
          <>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleClose}
            >
              {t("collaborativewall.modal.close", { ns: appCode })}
            </Button>
          </>
        )}
        {isReadMode && hasRightsToUpdateNote(note) && (
          <>
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={handleClose}
            >
              {t("collaborativewall.modal.close", { ns: appCode })}
            </Button>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleNavigateToEditMode}
            >
              {t("collaborativewall.modal.modify", { ns: appCode })}
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
            {t("collaborativewall.modal.cancel", { ns: appCode })}
          </Button>
        )}
        {isEditMode && (
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleSaveNote}
          >
            {t("collaborativewall.modal.save", { ns: appCode })}
          </Button>
        )}
        {isCreateMode && (
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleCreateNote}
          >
            {t("collaborativewall.modal.add", { ns: appCode })}
          </Button>
        )}
      </Modal.Footer>
    </Modal>,
    document.getElementById("portal") as HTMLElement,
  );
};
