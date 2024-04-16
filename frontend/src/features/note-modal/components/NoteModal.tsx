import { useRef, useState } from "react";

import { EditorRef } from "@edifice-ui/editor";
import { Button, Modal, useOdeClient } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

import { NoteContent } from "./NoteContent";
import {
  EditionMode,
  authorizedModes,
  useNoteModal,
} from "../hooks/useNoteModal";
import { noteColors } from "~/config/init-config";
import { useAccess } from "~/hooks/useAccess";
import { NoteMedia } from "~/models/noteMedia";
import { NoteProps } from "~/models/notes";
import { getNote } from "~/services/api";

export async function noteLoader({ request, params }: LoaderFunctionArgs) {
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

  const note = await getNote(wallId, noteId);

  if (!note) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return note;
}

export const NoteModal = () => {
  const data: NoteProps | undefined = useLoaderData() as NoteProps;

  const [colorValue, setColorValue] = useState<string[]>(
    data?.color || [noteColors.yellow.background],
  );
  const [media, setMedia] = useState<NoteMedia | null>(data?.media);

  const editorRef = useRef<EditorRef>(null);

  const {
    editionMode,
    isReadMode,
    isEditMode,
    isCreateMode,
    handleNavigateBack,
    handleNavigateToEditMode,
    handleSaveNote,
    handleCreateNote,
    handleClose,
  } = useNoteModal(editorRef, colorValue, data, media);

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
        <span className="text-gray-700 small">{data?.owner?.displayName}</span>
      </Modal.Subtitle>
      <Modal.Body>
        <NoteContent
          ref={editorRef}
          dataNote={data}
          editionMode={editionMode}
          media={media}
          setColorValue={setColorValue}
          setMedia={setMedia}
        />
      </Modal.Body>
      <Modal.Footer>
        {isReadMode && !hasRightsToUpdateNote(data) && (
          <>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleNavigateBack}
            >
              {t("collaborativewall.modal.close", { ns: appCode })}
            </Button>
          </>
        )}
        {isReadMode && hasRightsToUpdateNote(data) && (
          <>
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={handleNavigateBack}
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
            onClick={handleNavigateBack}
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
