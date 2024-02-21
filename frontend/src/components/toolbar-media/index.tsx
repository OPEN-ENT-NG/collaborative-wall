import { useMemo } from "react";

import { useMediaLibraryModal, useTipTapEditor } from "@edifice-ui/editor";
import {
  Landscape,
  Link,
  Mic,
  Paperclip,
  RecordVideo,
} from "@edifice-ui/icons";
import { MediaLibrary, Toolbar, useOdeClient } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router-dom";

import { NoteProps } from "~/models/notes";

export const ToolbarMedia = () => {
  const data = useLoaderData() as NoteProps;

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const { editor } = useTipTapEditor(true, data?.content);

  const { ref: mediaLibraryModalRef, ...mediaLibraryModalHandlers } =
    useMediaLibraryModal(editor);

  const toolbarItems: any[] = useMemo(() => {
    return [
      //--------------- IMAGE ---------------//
      {
        type: "icon",
        props: {
          icon: <Landscape />,
          className: "bg-green-200",
          "aria-label": t("tiptap.toolbar.picture"),
          onClick: () => mediaLibraryModalRef.current?.show("image"),
        },
        name: "image",
        tooltip: t("tiptap.toolbar.picture"),
      },
      //--------------- VIDEO ---------------//
      {
        type: "icon",
        props: {
          icon: <RecordVideo />,
          className: "bg-purple-200",
          "aria-label": t("tiptap.toolbar.video"),
          onClick: () => mediaLibraryModalRef.current?.show("video"),
        },
        name: "video",
        tooltip: t("tiptap.toolbar.video"),
      },
      //--------------- AUDIO ---------------//
      {
        type: "icon",
        props: {
          icon: <Mic />,
          className: "bg-red-200",
          "aria-label": t("tiptap.toolbar.audio"),
          onClick: () => mediaLibraryModalRef.current?.show("audio"),
        },
        name: "audio",
        tooltip: t("tiptap.toolbar.audio"),
      },
      //--------------- ATTACHMENT ---------------//
      {
        type: "icon",
        props: {
          icon: <Paperclip />,
          className: "bg-yellow-200",
          "aria-label": t("tiptap.toolbar.attachment"),
          onClick: () => mediaLibraryModalRef.current?.show("attachment"),
        },
        name: "attachment",
        tooltip: t("tiptap.toolbar.attachment"),
      },
      //--------------- LINKER ---------------//
      {
        type: "icon",
        props: {
          icon: <Link />,
          "aria-label": t("tiptap.toolbar.linker"),
          className: "bg-blue-200",
          onClick: () => mediaLibraryModalRef.current?.show("hyperlink"),
        },
        name: "linker",
        tooltip: t("tiptap.toolbar.linker"),
      },
    ];
  }, [t]);

  return (
    <>
      <Toolbar
        items={toolbarItems}
        variant="no-shadow"
        className="rounded-top px-16"
        ariaControls="editorContent"
      />
      <MediaLibrary
        appCode={appCode}
        ref={mediaLibraryModalRef}
        {...mediaLibraryModalHandlers}
      />
    </>
  );
};
