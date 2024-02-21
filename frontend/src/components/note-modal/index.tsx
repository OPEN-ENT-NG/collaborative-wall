import { useRef, useState } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import {
  Button,
  MediaLibraryType,
  Modal,
  useOdeClient,
} from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

import { ColorSelect } from "../color-select";
import { ShowMediaType } from "../show-media-type";
import { ToolbarMedia } from "../toolbar-media";
import { noteColors } from "~/config/init-config";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { getNote } from "~/services/api";
import { useUpdateNote } from "~/services/queries";

export async function noteLoader({ params }: LoaderFunctionArgs) {
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
  const [editorMode] = useState<"read" | "edit">("read");

  const editorRef = useRef<EditorRef>(null);
  const data = useLoaderData() as NoteProps;
  const updateNote = useUpdateNote();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const { editor } = useTipTapEditor(true, data?.content);

  const { ref: mediaLibraryModalRef, ...mediaLibraryModalHandlers } =
    useMediaLibraryModal(editor);

  const [colorValue, setColorValue] = useState<string[]>([
    noteColors.white.background,
  ]);
  const [mediaNote, setMediaNote] = useState<WorkspaceElement>();
  const [mediaType, setMediaType] = useState<MediaLibraryType>();

  const handleSaveNote = () => {
    const note: PickedNoteProps = {
      content: data.content,
      color: colorValue,
      idwall: data.idwall as string,
      modified: data.modified,
      x: data.x,
      y: data.y,
    };
    updateNote.mutateAsync({ id: data._id, note });
  };

  const handleNavigateBack = () => navigate("..");

  const handleClick = (type: any) => {
    mediaLibraryModalRef.current?.show(type);
  };

  return data ? (
    createPortal(
      <Modal
        id="NoteModal"
        onModalClose={handleNavigateBack}
        size="md"
        isOpen={true}
        focusId=""
        scrollable={true}
      >
        <Modal.Header onModalClose={handleNavigateBack}>
          {t("Note")}
        </Modal.Header>
        <Modal.Subtitle>{data.owner?.displayName}</Modal.Subtitle>
        <Modal.Body>
          <ColorSelect data={data} setColorValue={setColorValue} />

          {!mediaNote ? (
            <ToolbarMedia
              setMediaNote={setMediaNote}
              setMediaType={setMediaType}
            />
          ) : (
            <ShowMediaType media={mediaNote} mediaType={mediaType} />
          )}
          <Editor
            ref={editorRef}
            content={data?.content || ""}
            mode={editorMode}
          />
          <p>{data.content}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleNavigateBack}
          >
            {t("collaborativewall.modal.close", { ns: appCode })}
          </Button>
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleSaveNote}
          >
            {t("Save")}
          </Button>
        </Modal.Footer>
      </Modal>,
      document.getElementById("portal") as HTMLElement,
    )
  ) : (
    <p>{t("collaborativewall.note.notfound", { ns: appCode })}</p>
  );
};
