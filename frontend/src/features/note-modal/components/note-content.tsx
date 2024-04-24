import { Ref, forwardRef, useEffect } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import {
  IExternalLink,
  InternalLinkTabResult,
  MediaLibrary,
  MediaLibraryType,
  useOdeClient,
} from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import { ShowMediaType } from "~/features/collaborative-wall/components/show-media-type";
import { ToolbarMedia } from "~/features/note-modal/components/toolbar-media";
import { useLinkToolbar } from "~/hooks/use-link-toolbar";
import { useMediaLibrary } from "~/hooks/use-media-library";
import { NoteMedia } from "~/models/note-media";
import { NoteProps } from "~/models/notes";
import { EditionMode } from "../hooks/use-note-modal";
import { ColorSelect } from "./color-select";

export const NoteContent = forwardRef(
  (
    {
      media,
      editionMode,
      dataNote,
      setColorValue,
      setMedia,
    }: {
      media: NoteMedia | null;
      editionMode: EditionMode;
      dataNote?: NoteProps;
      setColorValue: (value: string[]) => void;
      setMedia: (value: NoteMedia | null) => void;
    },
    ref: Ref<EditorRef>,
  ) => {
    const { t } = useTranslation();
    const { appCode } = useOdeClient();

    const {
      ref: mediaLibraryRef,
      libraryMedia,
      ...mediaLibraryModalHandlers
    } = useMediaLibrary();

    const { onEdit, onOpen } = useLinkToolbar(null, mediaLibraryRef);

    const isReadMode = editionMode === "read";

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
            targetUrl: medialIb.target,
          });
        } else if (libraryMedia.resources) {
          const medialIb = libraryMedia as InternalLinkTabResult;
          setMedia({
            type: (media as NoteMedia).type,
            id: medialIb?.resources?.[0]?.assetId ?? "",
            name: medialIb?.resources?.[0]?.name || "",
            application: medialIb?.resources?.[0]?.application || "",
            url:
              medialIb.resources?.[0]?.path ??
              `/${medialIb.resources?.[0]?.application}#/view/${medialIb.resources?.[0]?.assetId}`,
            targetUrl: medialIb.target,
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

    const renderEdit = !isReadMode && (
      <div
        className="multimedia-section my-24"
        style={{ border: "1px solid #f2f2f2" }}
      >
        <div className="toolbar-media py-48 px-12">
          <ToolbarMedia handleClickMedia={handleClickMedia} />
          {t("collaborativewall.add.media", { ns: appCode })}
        </div>
      </div>
    );

    const renderRead = (media: NoteMedia) => (
      <div
        className={`multimedia-section ${isReadMode ? `mb-24` : `my-24`}`}
        style={{ border: isReadMode ? "" : "1px solid #f2f2f2" }}
      >
        <ShowMediaType
          media={media}
          modalNote={true}
          setMedia={setMedia}
          readonly={isReadMode}
          onEdit={onEdit}
          onOpen={onOpen}
        />
      </div>
    );

    return (
      <>
        {!isReadMode && (
          <ColorSelect dataNote={dataNote} setColorValue={setColorValue} />
        )}

        {!media?.url ? renderEdit : renderRead(media)}

        <Editor
          ref={ref}
          content={dataNote?.content || ""}
          mode={isReadMode ? "read" : "edit"}
          toolbar="none"
          variant="ghost"
          focus={isReadMode ? null : "end"}
          placeholder={t("collaborativewall.modal.note.content.placeholder", {
            ns: appCode,
          })}
        />

        <MediaLibrary
          appCode={appCode}
          ref={mediaLibraryRef}
          multiple={false}
          {...mediaLibraryModalHandlers}
        />
      </>
    );
  },
);
