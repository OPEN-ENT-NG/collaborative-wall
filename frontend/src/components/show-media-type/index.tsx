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

  const mediaClasses = clsx("media-center", {
    "d-block": readonly,
    "py-48": !readonly,
    "px-12": !readonly,
  });

  switch (media.type) {
    case "image":
      return (
        <div style={{ position: "relative", width: "100%" }} className="my-24">
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
            objectFit="cover"
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
        <div className={mediaClasses}>
          <audio src={media.url} controls data-document-id={media.id} muted />
          {!readonly && (
            <IconButton
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
            }
          ></Attachment>
        </div>
      );
    case "video":
      return (
        <div style={{ position: "relative" }} className="my-24">
          <IconButton
            className="delete-button mt-8 me-8"
            icon={<Delete />}
            variant="outline"
            color="danger"
            onClick={() => setMedia(null)}
            style={{ zIndex: "1" }}
          />
          <video
            src={media.url}
            data-document-id={media.id}
            controls
            style={{
              borderRadius: "16px",
              maxHeight: "350px",
            }}
          >
            <track default kind="captions" srcLang="fr" src=""></track>
          </video>
        </div>
      );
    default:
      break;
  }
};
