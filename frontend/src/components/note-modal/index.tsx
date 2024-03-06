import { useRef, useState } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import {
  Button,
  MediaLibrary,
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
import { useMediaLibrary } from "~/hooks/useMediaLibrary";
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

  const [colorValue, setColorValue] = useState<string[]>([
    noteColors.white.background,
  ]);
  const [mediasType, setMediasType] = useState<MediaLibraryType | undefined>();

  const {
    ref: mediaLibraryRef,
    medias,
    setMedias,
    ...mediaLibraryModalHandlers
  } = useMediaLibrary();

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

  const handleClickMedia = (type: MediaLibraryType) => {
    setMediasType(type);
    mediaLibraryRef.current?.show(type);
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
        <Modal.Body>
          <ColorSelect data={data} setColorValue={setColorValue} />
          <div className="multimedia-section my-24">
            {!medias ? (
              <div className="toolbar-media py-48 px-12">
                <ToolbarMedia handleClickMedia={handleClickMedia} />
                {t("collaborativewall.add.media", { ns: appCode })}
              </div>
            ) : (
              <ShowMediaType
                medias={medias as WorkspaceElement}
                setMedias={setMedias}
                mediasType={mediasType}
              />
            )}
          </div>
          <MediaLibrary
            appCode={appCode}
            ref={mediaLibraryRef}
            multiple={false}
            {...mediaLibraryModalHandlers}
          />
          <Editor
            ref={editorRef}
            content={data?.content || ""}
            mode={editorMode}
          />
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
