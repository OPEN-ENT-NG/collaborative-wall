import { Delete, Download } from "@edifice-ui/icons";
import { Attachment, IconButton, Image } from "@edifice-ui/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { NoteMedia } from "~/models/noteMedia";

export interface ShowMediaTypeProps {
  media: NoteMedia;
  setMedia?: (value: NoteMedia | null) => void;
  readonly?: boolean;
}

export const ShowMediaType = ({
  media,
  setMedia,
  readonly = true,
}: ShowMediaTypeProps) => {
  const { t } = useTranslation();

  const mediaClasses = clsx({
    "media-center": readonly,
    "d-block": readonly,
    "px-64": !readonly,
    "py-32": !readonly,
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
            objectFit={readonly ? "cover" : "contain"}
            ratio="16"
            style={{
              borderRadius: "16px",
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
            controls
            data-document-id={media.id}
            muted
            style={{
              width: "100%",
              zIndex: "1",
              position: "relative",
              maxWidth: "206px",
            }}
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
              !readonly ? (
                <>
                  <a href={media.url} style={{ zIndex: "1" }} download>
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
              style={{ zIndex: "2" }}
            />
          )}
          {!media.id ? (
            <iframe
              src={media.url}
              title={media.name}
              style={{
                borderRadius: "16px",
                maxHeight: "350px",
                position: "relative",
                zIndex: "1",
                width: "100%",
                height: readonly ? "" : "350px",
              }}
            ></iframe>
          ) : (
            <video
              src={media.url}
              data-document-id={media.id}
              controls
              style={{
                borderRadius: "16px",
                maxHeight: "350px",
                position: "relative",
                zIndex: "1",
                width: "100%",
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
