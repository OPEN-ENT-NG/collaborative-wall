import { useEffect, useRef, useState } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import {
  Button,
  MediaLibrary,
  MediaLibraryType,
  Modal,
  useOdeClient,
} from "@edifice-ui/react";
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
import { NoteMedia } from "~/models/noteMedia";
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
  const data = useLoaderData() as NoteProps;

  const [editorMode] = useState<"read" | "edit">("read");
  const [media, setMedia] = useState<NoteMedia | null>(data.media);
  const [colorValue, setColorValue] = useState<string[]>([
    noteColors.white.background,
  ]);

  const editorRef = useRef<EditorRef>(null);
  const updateNote = useUpdateNote();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const {
    ref: mediaLibraryRef,
    libraryMedia,
    ...mediaLibraryModalHandlers
  } = useMediaLibrary();

  useEffect(() => {
    if (libraryMedia) {
      setMedia({
        ...(media as NoteMedia),
        id: libraryMedia?._id || "",
        name: libraryMedia?.name || "",
        url: `/workspace/document/${libraryMedia?._id}`,
      });
    }
  }, [libraryMedia]);

  const handleSaveNote = () => {
    const note: PickedNoteProps = {
      content: data.content,
      color: colorValue,
      idwall: data.idwall as string,
      media: media || null,
      modified: data.modified,
      x: data.x,
      y: data.y,
    };

    updateNote.mutateAsync({ id: data._id, note });
    navigate("..");
  };

  const handleNavigateBack = () => navigate("..");

  const handleClickMedia = (type: MediaLibraryType) => {
    setMedia({ ...(media as NoteMedia), type });
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
            {!media ? (
              <div className="toolbar-media py-48 px-12">
                <ToolbarMedia handleClickMedia={handleClickMedia} />
                {t("collaborativewall.add.media", { ns: appCode })}
              </div>
            ) : (
              <ShowMediaType media={media} setMedia={setMedia} />
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
            onClick={handleSaveNote}
          >
            {t("save")}
          </Button>
        </Modal.Footer>
      </Modal>,
      document.getElementById("portal") as HTMLElement,
    )
  ) : (
    <p>{t("collaborativewall.note.notfound", { ns: appCode })}</p>
  );
};
