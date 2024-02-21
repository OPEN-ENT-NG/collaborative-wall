import { Image, MediaLibraryType } from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";

export const ShowMediaType = ({
  media,
  mediaType,
}: {
  media: WorkspaceElement;
  mediaType?: MediaLibraryType;
}) => {
  return (
    <Image src={`/workspace/document/${media?._id}`} alt={mediaType ?? ""} />
  );
};
