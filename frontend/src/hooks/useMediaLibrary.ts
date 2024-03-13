import { useRef, useState } from "react";

import {
  MediaLibraryRef,
  MediaLibraryResult,
  TabsItemProps,
  useWorkspaceFile,
} from "@edifice-ui/react";
import { WorkspaceElement } from "edifice-ts-client";

export const useMediaLibrary = () => {
  const mediaLibraryRef = useRef<MediaLibraryRef>(null);
  const [libraryMedia, setLibraryMedia] = useState<
    WorkspaceElement | String | undefined
  >();
  const { remove } = useWorkspaceFile();

  const onCancel = async (uploads?: WorkspaceElement[]) => {
    if (mediaLibraryRef.current?.type && uploads && uploads.length > 0) {
      await remove(uploads);
    }
    mediaLibraryRef.current?.hide();
  };
  const onSuccess = (result: MediaLibraryResult) => {
    if (mediaLibraryRef.current?.type) {
      if (result[result.length - 1]._id) {
        mediaLibraryRef.current?.hide();
        setLibraryMedia(result[result.length - 1]);
      } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(result, "text/html");
        const element = doc.body.firstChild as HTMLBodyElement;

        const href = element?.getAttribute("src");
        mediaLibraryRef.current?.hide();
        setLibraryMedia(href ?? undefined);
      }
    }
  };
  const onTabChange = async (
    _tab: TabsItemProps,
    uploads?: WorkspaceElement[],
  ) => {
    if (mediaLibraryRef.current?.type && uploads && uploads.length > 0) {
      await remove(uploads);
    }
  };

  return {
    ref: mediaLibraryRef,
    libraryMedia,
    setLibraryMedia,
    onCancel,
    onSuccess,
    onTabChange,
  };
};
