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

import { ColorSelect } from "./ColorSelect";
import { EditionMode } from "../hooks/useNoteModal";
import { ShowMediaType } from "~/components/show-media-type";
import { ToolbarMedia } from "~/components/toolbar-media";
import { useLinkToolbar } from "~/hooks/useLinkToolbar";
import { useMediaLibrary } from "~/hooks/useMediaLibrary";
import { NoteMedia } from "~/models/noteMedia";
import { NoteProps } from "~/models/notes";

export const NoteContent = ({
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

  const renderEdit = editionMode !== "read" && (
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
        readonly={editionMode === "read" ? true : false}
        onEdit={onEdit}
        onOpen={onOpen}
      />
    </div>
  );

  return (
    <>
      {editionMode !== "read" && (
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
        mode={editionMode === "read" ? "read" : "edit"}
        toolbar="none"
        variant="ghost"
        focus={editionMode === "read" ? null : "end"}
      />
    </>
  );
};
