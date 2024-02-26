import { Delete } from "@edifice-ui/icons";
import { IconButton, Image, MediaLibraryType } from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";

export const ShowMediaType = ({
  media,
  mediaType,
  setMediaNote,
}: {
  media: WorkspaceElement;
  mediaType?: MediaLibraryType;
  setMediaNote: (value: WorkspaceElement | undefined) => void;
}) => {
  const showGetMedia = () => {
    switch (mediaType) {
      case "image":
        return (
          <div style={{ position: "relative" }}>
            <IconButton
              className="delete-button mt-8 me-8"
              icon={<Delete />}
              variant="outline"
              color="danger"
              onClick={() => setMediaNote(undefined)}
            />
            <Image
              src={`/workspace/document/${media._id}`}
              alt={mediaType}
              width="100%"
              style={{ borderRadius: "16px" }}
            />
          </div>
        );
      case "audio":
        return (
          <div className="audio-center py-48 px-12">
            <audio
              src={`/workspace/document/${media._id}`}
              controls
              data-document-id={media._id}
              muted
            />
            <IconButton
              icon={<Delete />}
              variant="outline"
              color="danger"
              onClick={() => setMediaNote(undefined)}
            />
          </div>
        );
      default:
        break;
    }
  };
  return showGetMedia();
};
