import { RefObject, useEffect } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import {
  IExternalLink,
  MediaLibrary,
  MediaLibraryType,
  useOdeClient,
} from "@edifice-ui/react";
import { ILinkedResource, WorkspaceElement } from "edifice-ts-client";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs } from "react-router-dom";

import { ColorSelect } from "../color-select";
import { ShowMediaType } from "../show-media-type";
import { ToolbarMedia } from "../toolbar-media";
import { EditionMode } from "../update-note-modal";
import { useLinkToolbar } from "~/hooks/useLinkToolbar";
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

  const { onEdit, onOpen } = useLinkToolbar(null, mediaLibraryRef);

  const handleClickMedia = (type: MediaLibraryType) => {
    setMedia({ ...(media as NoteMedia), type });
    mediaLibraryRef.current?.show(type);
  };

  useEffect(() => {
    if (libraryMedia) {
      if (libraryMedia.url) {
        const medialIb = libraryMedia as IExternalLink;
        setMedia({
          type: (media as NoteMedia).type,
          id: "",
          application: "",
          name: medialIb?.text || "",
          url: medialIb?.url,
        });
      } else if (libraryMedia.assetId) {
        const medialIb = libraryMedia as ILinkedResource;
        setMedia({
          type: (media as NoteMedia).type,
          id: medialIb?.assetId,
          name: medialIb?.name || "",
          application: medialIb?.application || "",
          url:
            medialIb.path ??
            `/${medialIb.application}#/view/${medialIb.assetId}`,
        });
      } else {
        const medialIb = libraryMedia as WorkspaceElement;
        setMedia({
          type: (media as NoteMedia).type,
          id: medialIb?._id || "",
          name: medialIb?.application || "",
          application: "",
          url: medialIb?._id
            ? `/workspace/document/${medialIb?._id}`
            : (libraryMedia as string),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryMedia]);

  const renderEdit = editionMode === "edit" && (
    <div className="multimedia-section my-24">
      <div className="toolbar-media py-48 px-12">
        <ToolbarMedia handleClickMedia={handleClickMedia} />
        {t("collaborativewall.add.media", { ns: appCode })}
      </div>
    </div>
  );

  const renderRead = (media: NoteMedia) => (
    <div className="multimedia-section my-24">
      <ShowMediaType
        media={media}
        modalNote={true}
        setMedia={setMedia}
        readonly={editionMode === "edit" ? false : true}
        onEdit={onEdit}
        onOpen={onOpen}
      />
    </div>
  );

  return (
    <>
      {editionMode === "edit" && (
        <ColorSelect dataNote={dataNote} setColorValue={setColorValue} />
      )}
      {!media?.url ? renderEdit : renderRead(media)}
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
