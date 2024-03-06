import { useRef, useState } from "react";

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
import { useMediaLibrary } from "~/hooks/useMediaLibrary";
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
  dataNote,
  setColorValue,
}: {
  dataNote: NoteProps;
  setColorValue: (value: string[]) => void;
}) => {
  const [editorMode] = useState<"read" | "edit">("read");

  const editorRef = useRef<EditorRef>(null);

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const [mediasType, setMediasType] = useState<MediaLibraryType | undefined>();

  const {
    ref: mediaLibraryRef,
    medias,
    setMedias,
    ...mediaLibraryModalHandlers
  } = useMediaLibrary();

  const handleClickMedia = (type: MediaLibraryType) => {
    setMediasType(type);
    mediaLibraryRef.current?.show(type);
  };

  return (
    <>
      <ColorSelect dataNote={dataNote} setColorValue={setColorValue} />
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
        content={dataNote?.content || ""}
        mode={editorMode}
      />
      <p>{dataNote.content || ""}</p>{" "}
    </>
  );
};
