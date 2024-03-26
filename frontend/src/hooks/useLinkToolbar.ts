import { RefObject, useCallback } from "react";

import { MediaLibraryRef } from "@edifice-ui/react";
import { Editor } from "@tiptap/react";

/**
 * Custom hook to handle LinkToolbar events.
 * @returns {
 * `onOpen`: Opens a link ,
 * `onEdit`: Edit a link,
 * `onUnlink`: Removes a link,
 * }
 */
export const useLinkToolbar = (
  editor: Editor | null,
  mediaLibraryRef: RefObject<MediaLibraryRef>,
) => {
  const onEdit = useCallback(
    (attrs: any) => {
      if (editor?.isActive("hyperlink"))
        editor.commands.extendMarkRange("hyperlink");

      const attrsLinker = attrs;
      if (attrsLinker["data-id"] || attrsLinker["data-app-prefix"]) {
        mediaLibraryRef.current?.showLink({
          target: attrs.target,
          resourceId: attrsLinker["data-id"],
          appPrefix: attrsLinker["data-app-prefix"],
        });
      } else {
        const { href, target, name } = attrs;
        mediaLibraryRef.current?.showLink({
          link: {
            url: href || "",
            target: target || undefined,
            text: name,
          },
        });
      }
    },
    [editor, mediaLibraryRef],
  );

  const onOpen = (attrs: any) => {
    window.open(attrs.href || "about:blank", "_blank");
  };

  return {
    onEdit,
    onOpen,
  };
};
