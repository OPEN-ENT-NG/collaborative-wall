import { Delete, Download } from "@edifice-ui/icons";
import {
  Attachment,
  IconButton,
  Image,
  MediaLibraryType,
} from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";
import { useTranslation } from "react-i18next";

export const ShowMediaType = ({
  medias,
  setMedias,
  mediasType,
}: {
  medias: WorkspaceElement;
  setMedias: (value: WorkspaceElement | undefined) => void;
  mediasType: MediaLibraryType | undefined;
}) => {
  const { t } = useTranslation();

  const showGetMedia = () => {
    switch (mediasType) {
      case "image":
        return (
          <div style={{ position: "relative" }}>
            <IconButton
              className="delete-button mt-8 me-8"
              icon={<Delete />}
              variant="outline"
              color="danger"
              onClick={() => setMedias(undefined)}
            />
            <Image
              src={`/workspace/document/${medias?._id}`}
              alt={mediasType}
              width="100%"
              style={{ borderRadius: "16px" }}
            />
          </div>
        );
      case "audio":
        return (
          <div className="audio-center py-48 px-12">
            <audio
              src={`/workspace/document/${medias._id}`}
              controls
              data-document-id={medias._id}
              muted
            />
            <IconButton
              icon={<Delete />}
              variant="outline"
              color="danger"
              onClick={() => setMedias(undefined)}
            />
          </div>
        );
      case "attachment":
        return (
          <div className="audio-center py-48 px-12">
            <Attachment
              name={medias.name}
              options={
                <>
                  <a href={`/workspace/document/${medias._id}`} download>
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
                    onClick={() => setMedias(undefined)}
                  />
                </>
              }
            ></Attachment>
          </div>
        );
      default:
        break;
    }
  };
  return showGetMedia();
};
