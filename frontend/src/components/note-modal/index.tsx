import { useMemo, useRef, useState } from "react";

import {
  Editor,
  EditorRef,
  useMediaLibraryModal,
  useTipTapEditor,
} from "@edifice-ui/editor";
import {
  Landscape,
  Link,
  Mic,
  Paperclip,
  RecordVideo,
} from "@edifice-ui/icons";
import {
  Button,
  MediaLibrary,
  Modal,
  Select,
  Toolbar,
  useOdeClient,
} from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

import { noteColors } from "~/config/init-config";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { getNote } from "~/services/api";
import { useUpdateNote } from "~/services/queries";
import { Square } from "~/utils/square";

export async function noteLoader({ params }: LoaderFunctionArgs) {
  const { wallId, noteId } = params;

  if (!wallId || !noteId) {
    throw new Response("", {
      status: 404,
      statusText: "Wall id or Note id is null",
    });
  }

  const note = await getNote(wallId, noteId);

  if (!note) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return note;
}

export const NoteModal = () => {
  const [editorMode] = useState<"read" | "edit">("read");

  const editorRef = useRef<EditorRef>(null);
  const data = useLoaderData() as NoteProps;
  const updateNote = useUpdateNote();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const { editor } = useTipTapEditor(true, data?.content);

  const { ref: mediaLibraryModalRef, ...mediaLibraryModalHandlers } =
    useMediaLibraryModal(editor);

  const [colorValue, setColorValue] = useState<string[]>([
    noteColors.white.background,
  ]);

  const colorsList = [
    {
      label: t("collaborativewall.color.white", { ns: appCode }),
      value: noteColors.white.background,
      icon: <Square borderColor={noteColors.white.border} />,
    },
    {
      label: t("collaborativewall.color.yellow", { ns: appCode }),
      value: noteColors.yellow.background,
      icon: (
        <Square
          className="bg-yellow-200"
          borderColor={noteColors.yellow.border}
        />
      ),
    },
    {
      label: t("collaborativewall.color.orange", { ns: appCode }),
      value: noteColors.orange.background,
      icon: (
        <Square
          className="bg-orange-200"
          borderColor={noteColors.orange.border}
        />
      ),
    },
    {
      label: t("collaborativewall.color.red", { ns: appCode }),
      value: noteColors.red.background,
      icon: (
        <Square className="bg-red-200" borderColor={noteColors.red.border} />
      ),
    },
    {
      label: t("collaborativewall.color.purple", { ns: appCode }),
      value: noteColors.purple.background,
      icon: (
        <Square
          className="bg-purple-200"
          borderColor={noteColors.purple.border}
        />
      ),
    },
    {
      label: t("collaborativewall.color.blue", { ns: appCode }),
      value: noteColors.blue.background,
      icon: (
        <Square className="bg-blue-200" borderColor={noteColors.blue.border} />
      ),
    },
    {
      label: t("collaborativewall.color.green", { ns: appCode }),
      value: noteColors.green.background,
      icon: (
        <Square
          className="bg-green-200"
          borderColor={noteColors.green.border}
        />
      ),
    },
  ];

  const handleSaveNote = () => {
    const note: PickedNoteProps = {
      content: data.content,
      color: colorValue,
      idwall: data.idwall as string,
      modified: data.modified,
      x: data.x,
      y: data.y,
    };
    updateNote.mutateAsync({ id: data._id, note });
  };

  const placeholderValue = () => {
    const color = colorsList.find((value) => value.value === data.color?.[0]);

    if (!color) return undefined;
    return color;
  };

  const handleNavigateBack = () => navigate("..");

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
          //onClick: () => showLinkModal(),
        },
        name: "linker",
        tooltip: t("tiptap.toolbar.linker"),
      },
    ];
  }, [t]);

  return data ? (
    createPortal(
      <Modal
        id="NoteModal"
        onModalClose={handleNavigateBack}
        size="md"
        isOpen={true}
        focusId=""
        scrollable={true}
      >
        <Modal.Header onModalClose={handleNavigateBack}>
          {t("Note")}
        </Modal.Header>
        <Modal.Subtitle>{data.owner?.displayName}</Modal.Subtitle>
        <Modal.Body>
          <Select
            icon={
              placeholderValue()?.icon ?? (
                <Square borderColor={noteColors.white.border} />
              )
            }
            options={colorsList}
            placeholderOption={
              placeholderValue()?.label ??
              t("collaborativewall.color.white", { ns: appCode })
            }
            onValueChange={(value) => setColorValue([value as string])}
          />
          <Toolbar
            items={toolbarItems}
            variant="no-shadow"
            className="rounded-top px-16"
            ariaControls="editorContent"
          />
          <Editor
            ref={editorRef}
            content={data?.content || ""}
            mode={editorMode}
          ></Editor>

          <MediaLibrary
            appCode={appCode}
            ref={mediaLibraryModalRef}
            {...mediaLibraryModalHandlers}
          />

          <p>{data.content}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleNavigateBack}
          >
            {t("collaborativewall.modal.close", { ns: appCode })}
          </Button>
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleSaveNote}
          >
            {t("Save")}
          </Button>
        </Modal.Footer>
      </Modal>,
      document.getElementById("portal") as HTMLElement,
    )
  ) : (
    <p>{t("collaborativewall.note.notfound", { ns: appCode })}</p>
  );
};
