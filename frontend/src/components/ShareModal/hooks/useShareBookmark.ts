import { Dispatch, useId, useRef, useState } from "react";

import { useToast, useToggle } from "@edifice-ui/react";
import { ShareRightWithVisibles, odeServices } from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import { ShareAction } from "./useShare";

interface UseShareBookmarkProps {
  shareRights: ShareRightWithVisibles;
  shareDispatch: Dispatch<ShareAction>;
}

export type BookmarkProps = {
  name: string;
  id: string;
};

export const useShareBookmark = ({
  shareRights,
  shareDispatch,
}: UseShareBookmarkProps) => {
  const toast = useToast();
  const { t } = useTranslation();

  const refBookmark = useRef<HTMLInputElement>(null);

  const [bookmark, setBookmark] = useState<BookmarkProps>({
    name: "",
    id: useId(),
  });
  const [showBookmark, setShowBookmark] = useToggle(false);
  const [showBookmarkInput, toggleBookmarkInput] = useState<boolean>(false);

  const toggleBookmark = () => {
    setShowBookmark();
  };

  const handleBookmarkChange = () => {
    setBookmark((prev) => ({
      ...prev,
      name: refBookmark.current?.value || "",
    }));
  };

  const saveBookmark = async (name: string) => {
    try {
      const res = await odeServices.directory().saveBookmarks(name, {
        users: shareRights.rights
          .filter((right: { type: string }) => right.type === "user")
          .map((u: { id: any }) => u.id),
        groups: shareRights.rights
          .filter((right: { type: string }) => right.type === "group")
          .map((u: { id: any }) => u.id),
        bookmarks: shareRights.rights
          .filter((right: { type: string }) => right.type === "sharebookmark")
          .map((u: { id: any }) => u.id),
      });

      toast.success(t("explorer.bookmarked.status.saved"));

      shareDispatch({
        type: "updateShareRights",
        payload: {
          ...shareRights,
          visibleBookmarks: [
            ...shareRights.visibleBookmarks,
            {
              displayName: name,
              id: res.id,
            },
          ],
        },
      });

      setBookmark((prev) => ({
        ...prev,
        bookmarkId: prev.id + new Date().getTime().toString(),
      }));
      toggleBookmarkInput(false);
    } catch (e) {
      console.error("Failed to save bookmark", e);
      toast.error(t("explorer.bookmarked.status.error"));
    }
  };

  const handleOnSave = () => {
    const inputValue = refBookmark.current?.value || "";
    saveBookmark(inputValue);
  };

  return {
    refBookmark,
    showBookmark,
    showBookmarkInput,
    bookmark,
    handleBookmarkChange,
    setBookmark,
    handleOnSave,
    toggleBookmark,
    toggleBookmarkInput,
  };
};
