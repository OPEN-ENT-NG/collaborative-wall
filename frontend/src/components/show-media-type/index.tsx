import { Delete } from "@edifice-ui/icons";
import { IconButton, Image, MediaLibraryType } from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";

export const ShowMediaType = ({
  medias,
  setMedias,
  mediasType,
}: {
  medias: WorkspaceElement;
  setMedias: (value: WorkspaceElement | undefined) => void;
  mediasType: MediaLibraryType | undefined;
}) => {
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
      default:
        break;
    }
  };
  return showGetMedia();
};
