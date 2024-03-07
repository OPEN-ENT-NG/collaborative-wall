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
    WorkspaceElement | undefined
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
      mediaLibraryRef.current?.hide();
      setLibraryMedia(result[result.length - 1]);
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
