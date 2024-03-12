import { useEffect, useRef, useState } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import {
  MediaLibrary,
  MediaLibraryType,
  useOdeClient,
} from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs } from "react-router-dom";

import { ColorSelect } from "../color-select";
import { ShowMediaType } from "../show-media-type";
import { ToolbarMedia } from "../toolbar-media";
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
  media,
  dataNote,
}: {
  setColorValue: (value: string[]) => void;
  setMedia: (value: NoteMedia | null) => void;
  media: NoteMedia | null;
  dataNote?: NoteProps;
}) => {
  const [editorMode] = useState<"read" | "edit">("read");

  const editorRef = useRef<EditorRef>(null);

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
      setMedia({
        ...(media as NoteMedia),
        id: libraryMedia?._id || "",
        name: libraryMedia?.name || "",
        url: `/workspace/document/${libraryMedia?._id}`,
      });
    }
  }, [libraryMedia]);

  return (
    <>
      <ColorSelect dataNote={dataNote} setColorValue={setColorValue} />
      <div className="multimedia-section my-24">
        {!media ? (
          <div className="toolbar-media py-48 px-12">
            <ToolbarMedia handleClickMedia={handleClickMedia} />
            {t("collaborativewall.add.media", { ns: appCode })}
          </div>
        ) : (
          <ShowMediaType media={media} setMedia={setMedia} readonly={false} />
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
        content={dataNote?.content || ""}
        mode={editorMode}
      />
      <p>{dataNote?.content || ""}</p>{" "}
    </>
  );
};
