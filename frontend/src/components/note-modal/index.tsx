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
  const updateNote = useUpdateNote();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [colorValue, setColorValue] = useState<string[]>(
    colorsNotes["#FFFFFF"],
  );

  const colorsList = [
    {
      label: t("collaborativewall.color.white"),
      value: "#FFFFFF",
      icon: <Square colors={colorsNotes["#FFFFFF"]} />,
    },
    {
      label: t("collaborativewall.color.yellow"),
      value: "#FCF7DE",
      icon: <Square colors={colorsNotes["#FCF7DE"]} />,
    },
    {
      label: t("collaborativewall.color.orange"),
      value: "#FFEFE3",
      icon: <Square colors={colorsNotes["#FFEFE3"]} />,
    },
    {
      label: t("collaborativewall.color.red"),
      value: "#FFECEE",
      icon: <Square colors={colorsNotes["#FFECEE"]} />,
    },
    {
      label: t("collaborativewall.color.purple"),
      value: "#F6ECF9",
      icon: <Square colors={colorsNotes["#F6ECF9"]} />,
    },
    {
      label: t("collaborativewall.color.blue"),
      value: "#E5F5FF",
      icon: <Square colors={colorsNotes["#E5F5FF"]} />,
    },
    {
      label: t("collaborativewall.color.green"),
      value: "#E6F9F8",
      icon: <Square colors={colorsNotes["#E6F9F8"]} />,
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

  const placeholderValue = () => {
    const color = colorsList.find((value) => value.value === data.color?.[0]);
    if (color) {
      return color;
    }
    return undefined;
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
            icon={
              <Square
                colors={
                  data.color && placeholderValue()
                    ? data.color
                    : colorsNotes["#FFFFFF"]
                }
              />
            }
            options={colorsList}
            placeholderOption={
              placeholderValue()?.label ?? t("collaborativewall.color.white")
            }
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
