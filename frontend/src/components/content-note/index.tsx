import { RefObject, useEffect } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import {
  MediaLibrary,
  MediaLibraryType,
  useOdeClient,
} from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs } from "react-router-dom";

import { ColorSelect } from "../color-select";
import { ShowMediaType } from "../show-media-type";
import { ToolbarMedia } from "../toolbar-media";
import { EditionMode } from "../update-note-modal";
import { useMediaLibrary } from "~/hooks/useMediaLibrary";
import { NoteMedia } from "~/models/noteMedia";
import { NoteProps } from "~/models/notes";
import { getNote } from "~/services/api";

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

export const ContentNote = ({
  setColorValue,
  setMedia,
  editorRef,
  media,
  editionMode,
  dataNote,
}: {
  setColorValue: (value: string[]) => void;
  setMedia: (value: NoteMedia | null) => void;
  editorRef: RefObject<EditorRef>;
  media: NoteMedia | null;
  editionMode: EditionMode;
  dataNote?: NoteProps;
}) => {
  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const {
    ref: mediaLibraryRef,
    libraryMedia,
    ...mediaLibraryModalHandlers
  } = useMediaLibrary();

  const handleClickMedia = (type: MediaLibraryType) => {
    setMedia({ ...(media as NoteMedia), type });
    mediaLibraryRef.current?.show(type);
  };

  useEffect(() => {
    if (libraryMedia) {
      const medialIb = libraryMedia as WorkspaceElement;

      setMedia({
        type: (media as NoteMedia).type,
        id: medialIb?._id || "",
        name: medialIb?.name || "",
        url: medialIb?._id
          ? `/workspace/document/${medialIb?._id}`
          : (libraryMedia as string),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryMedia]);

  return (
    <>
      {editionMode === "edit" && (
        <ColorSelect dataNote={dataNote} setColorValue={setColorValue} />
      )}
      {editionMode !== "read" && (
        <div className="multimedia-section my-24">
          {!media?.url ? (
            editionMode === "edit" && (
              <div className="toolbar-media py-48 px-12">
                <ToolbarMedia handleClickMedia={handleClickMedia} />
                {t("collaborativewall.add.media", { ns: appCode })}
              </div>
            )
          ) : (
            <ShowMediaType
              media={media}
              modalNote={true}
              setMedia={setMedia}
              readonly={editionMode === "edit" ? false : true}
            />
          )}
        </div>
      )}
      <MediaLibrary
        appCode={appCode}
        ref={mediaLibraryRef}
        multiple={false}
        {...mediaLibraryModalHandlers}
      />
      <Editor
        ref={editorRef}
        content={dataNote?.content || ""}
        mode={editionMode}
        toolbar="none"
        variant="ghost"
      />
    </>
  );
};
