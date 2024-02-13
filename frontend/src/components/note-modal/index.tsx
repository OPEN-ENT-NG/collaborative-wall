import { useRef, useState } from "react";

import { Editor, EditorRef } from "@edifice-ui/editor";
import { Button, Modal, Select } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

import { colorsNotes } from "~/config/init-config";
import { NoteProps } from "~/models/notes";
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [colorValue, setColorValue] = useState<string[]>(colorsNotes.white);

  const updateNote = useUpdateNote();

  const menuColors = [
    {
      label: t("collaborativewall.color.white"),
      value: "white",
      icon: <Square colors={colorsNotes.white} />,
    },
    {
      label: t("collaborativewall.color.yellow"),
      value: "yellow",
      icon: <Square colors={colorsNotes.yellow} />,
    },
    {
      label: t("collaborativewall.color.orange"),
      value: "orange",
      icon: <Square colors={colorsNotes.orange} />,
    },
    {
      label: t("collaborativewall.color.red"),
      value: "red",
      icon: <Square colors={colorsNotes.red} />,
    },
    {
      label: t("collaborativewall.color.purple"),
      value: "purple",
      icon: <Square colors={colorsNotes.purple} />,
    },
    {
      label: t("collaborativewall.color.blue"),
      value: "blue",
      icon: <Square colors={colorsNotes.blue} />,
    },
    {
      label: t("collaborativewall.color.green"),
      value: "green",
      icon: <Square colors={colorsNotes.green} />,
    },
  ];

  const handleSaveNote = () => {
    const note: {
      content: string;
      x: number;
      y: number;
      idwall: string;
      color: string[];
      modified?: { $date: number };
    } = {
      content: data.content,
      color: colorValue,
      idwall: data.idwall as string,
      modified: data.modified,
      x: data.x,
      y: data.y,
    };
    updateNote.mutateAsync({ id: data._id, note });
  };

  return data ? (
    createPortal(
      <Modal
        id="NoteModal"
        onModalClose={() => navigate("..")}
        size="md"
        isOpen={true}
        focusId=""
        scrollable={true}
      >
        <Modal.Header onModalClose={() => navigate("..")}>
          {t("Note")}
        </Modal.Header>
        <Modal.Subtitle>{data.owner?.displayName}</Modal.Subtitle>
        <Modal.Body>
          <Select
            icon={<Square colors={colorsNotes.white} />}
            options={menuColors}
            placeholderOption={t("collaborativewall.color.white")}
            onValueChange={(value) =>
              setColorValue(colorsNotes[value as string])
            }
          />
          <Editor
            ref={editorRef}
            content={data?.content || ""}
            mode={editorMode}
          ></Editor>

          <p>{data.content}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={() => navigate("..")}
          >
            {t("Fermer")}
          </Button>
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={() => handleSaveNote()}
          >
            {t("Save")}
          </Button>
        </Modal.Footer>
      </Modal>,
      document.getElementById("portal") as HTMLElement,
    )
  ) : (
    <p>{t("collaborativewall.note.notfound")}</p>
  );
};
