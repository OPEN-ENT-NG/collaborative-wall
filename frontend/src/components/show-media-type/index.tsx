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
              height="350"
              style={{ borderRadius: "16px" }}
            />
          </div>
        );
      default:
        setMedias(undefined);
        break;
    }
  };
  return showGetMedia();
};
