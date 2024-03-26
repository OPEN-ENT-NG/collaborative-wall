import { Delete, Download } from "@edifice-ui/icons";
import { Attachment, IconButton, Image } from "@edifice-ui/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { NoteMedia } from "~/models/noteMedia";

export interface ShowMediaTypeProps {
  media: NoteMedia;
  modalNote?: boolean;
  setMedia?: (value: NoteMedia | null) => void;
  readonly?: boolean;
}

export const ShowMediaType = ({
  media,
  modalNote = false,
  setMedia,
  readonly = true,
}: ShowMediaTypeProps) => {
  const { t } = useTranslation();

  const mediaClasses = clsx({
    "media-center": !modalNote,
    "d-block": !modalNote,
    "px-64": modalNote,
    "py-32": modalNote,
  });

  switch (media.type) {
    case "image":
      return (
        <div style={{ position: "relative", width: "100%" }}>
          {!readonly && (
            <IconButton
              className="delete-button mt-8 me-8"
              icon={<Delete />}
              variant="outline"
              color="danger"
              style={{ zIndex: "1" }}
              onClick={() => setMedia?.(null)}
            />
          )}
          <Image
            src={media.url}
            alt={media.type}
            width="100%"
            objectFit={modalNote ? "contain" : "cover"}
            ratio="16"
            style={{
              borderRadius: "8px",
              maxHeight: "350px",
            }}
          />
        </div>
      );
    case "audio":
      return (
        <div className={`${mediaClasses} media-center`}>
          <audio
            src={media.url}
            className="media-audio"
            controls
            data-document-id={media.id}
            muted
          >
            <track default kind="captions" srcLang="fr" src=""></track>
          </audio>
          {!readonly && (
            <IconButton
              className="ms-8"
              icon={<Delete />}
              variant="outline"
              color="danger"
              onClick={() => setMedia?.(null)}
            />
          )}
        </div>
      );
    case "attachment":
      return (
        <div className={mediaClasses}>
          <Attachment
            name={media.name}
            options={
              modalNote ? (
                <>
                  <a href={media.url} download>
                    <IconButton
                      icon={<Download />}
                      color="tertiary"
                      type="button"
                      variant="ghost"
                      aria-label={t("download")}
                    />
                  </a>
                  {!readonly && (
                    <IconButton
                      icon={<Delete />}
                      variant="ghost"
                      color="danger"
                      aria-label={t("remove")}
                      onClick={() => setMedia?.(null)}
                    />
                  )}
                </>
              ) : undefined
            }
          ></Attachment>
        </div>
      );
    case "video":
      return (
        <div style={{ position: "relative" }}>
          {!readonly && (
            <IconButton
              className="delete-button mt-8 me-8"
              icon={<Delete />}
              variant="outline"
              color="danger"
              onClick={() => setMedia?.(null)}
            />
          )}
          {!media.id ? (
            <iframe
              src={media.url}
              title={media.name}
              className="media-video"
              style={{
                height: modalNote ? "350px" : "",
              }}
            />
          ) : (
            <video
              src={media.url}
              data-document-id={media.id}
              controls
              className="media-video"
              style={{
                marginBottom: "-8px",
              }}
            >
              <track default kind="captions" srcLang="fr" src=""></track>
            </video>
          )}
        </div>
      );
    default:
      break;
  }
};
