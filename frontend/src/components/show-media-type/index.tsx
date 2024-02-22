import { RefObject } from "react";

import { Delete } from "@edifice-ui/icons";
import { IconButton, Image, MediaLibraryRef } from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";

export const ShowMediaType = ({
  media,
  mediaLibraryRef,
  setMediaNote,
}: {
  media: WorkspaceElement;
  mediaLibraryRef: RefObject<MediaLibraryRef>;
  setMediaNote: (value: WorkspaceElement | undefined) => void;
}) => {
  const showGetMedia = () => {
    switch (mediaLibraryRef.current?.type) {
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
              alt={mediaLibraryRef.current?.type}
              width="100%"
              height="350"
              style={{ borderRadius: "16px" }}
            />
          </div>
        );
      default:
        setMediaNote(undefined);
        break;
    }
  };
  return showGetMedia();
};
