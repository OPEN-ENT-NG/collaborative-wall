import { Delete, Download } from "@edifice-ui/icons";
import { Attachment, IconButton, Image } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { NoteMedia } from "~/models/noteMedia";

export const ShowMediaType = ({
  media,
  setMedia,
}: {
  media: NoteMedia;
  setMedia: (value: NoteMedia | null) => void;
}) => {
  const { t } = useTranslation();

  switch (media.type) {
    case "image":
      return (
        <div style={{ position: "relative" }} className="my-24">
          <IconButton
            className="delete-button mt-8 me-8"
            icon={<Delete />}
            variant="outline"
            color="danger"
            style={{ zIndex: "1" }}
            onClick={() => setMedia(null)}
          />
          <Image
            src={media.url}
            alt={media.type}
            width="100%"
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
        <div className="audio-center py-48 px-12">
          <audio src={media.url} controls data-document-id={media.id} muted>
            <track default kind="captions" srcLang="fr" src=""></track>
          </audio>
          <IconButton
            icon={<Delete />}
            variant="outline"
            color="danger"
            onClick={() => setMedia(null)}
          />
        </div>
      );
    case "attachment":
      return (
        <div className="audio-center py-48 px-12">
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
                <IconButton
                  icon={<Delete />}
                  variant="ghost"
                  color="danger"
                  aria-label={t("remove")}
                  onClick={() => setMedia(null)}
                />
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
