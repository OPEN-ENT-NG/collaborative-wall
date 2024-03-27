import { useEffect, useRef, useState } from "react";

import { EditorRef } from "@edifice-ui/editor";
import { Button, Modal, useOdeClient } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { ContentNote } from "../content-note";
import { useAccess } from "~/hooks/useAccess";
import { NoteMedia } from "~/models/noteMedia";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { getNote } from "~/services/api";
import { useUpdateNote } from "~/services/queries";
import { updateData } from "~/services/queries/helpers";
import { useHistoryStore } from "~/store";

export type EditionMode = "read" | "edit";

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

export const UpdateNoteModal = () => {
  const data = useLoaderData() as NoteProps;
  const queryClient = useQueryClient();

  const [colorValue, setColorValue] = useState<string[]>(data.color);
  const [media, setMedia] = useState<NoteMedia | null>(data.media);

  const editorRef = useRef<EditorRef>(null);

  const { hasRightsToUpdateNote } = useAccess();

  const updateNote = useUpdateNote();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editionMode: EditionMode =
    (searchParams.get("mode") as EditionMode) || "read";

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const { setHistory } = useHistoryStore();

  // There is a window event listener on Space, "-", "=", "+" keys to move, unzoom, zoom the whiteboard respectively,
  // So we need to stop these keys propagation in order to make these keys work in Editor.
  useEffect(() => {
    const stopPropagation = (event: KeyboardEvent) => {
      if (
        event.code === "Space" ||
        event.key === "-" ||
        event.key === "=" ||
        event.key === "+"
      ) {
        event.stopPropagation();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      stopPropagation(event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      stopPropagation(event);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigateBack = () => navigate("..");

  const handleNavigateToEditMode = () => {
    navigate(`../note/${data._id}?mode=edit`);
  };

  const handleSaveNote = async () => {
    const note: PickedNoteProps = {
      content: editorRef.current?.getContent("plain") as string,
      color: colorValue,
      idwall: data.idwall as string,
      media: media || null,
      modified: data.modified,
      x: data.x,
      y: data.y,
    };

    await updateNote.mutateAsync(
      { id: data._id, note },
      {
        onSuccess: async (responseData, { id }) => {
          const { status, wall: notes } = responseData;

          if (status !== "ok") return;

          const updatedNote = notes.find((note: NoteProps) => note._id === id);

          updateData(queryClient, updatedNote);

          setHistory({
            type: "edit",
            item: {
              ...updatedNote,
              content: data.content,
              color: data.color,
              media: data.media,
            },
            previous: {
              x: data.x,
              y: data.y,
              color: data.color,
              content: data.content,
              media: data.media || null,
            },
            next: {
              x: updatedNote.x,
              y: updatedNote.y,
              color: updatedNote.color,
              content: updatedNote.content,
              media: updatedNote.media || null,
            },
          });
        },
      },
    );

    handleNavigateBack();
  };

  return data ? (
    createPortal(
      <Modal
        id="UpdateNoteModal"
        onModalClose={handleNavigateBack}
        size="md"
        isOpen={true}
        focusId=""
        scrollable={true}
      >
        <Modal.Header onModalClose={handleNavigateBack}>
          {t("Note")}
        </Modal.Header>
        <Modal.Subtitle>
          <span className="text-gray-700 small">{data.owner?.displayName}</span>
        </Modal.Subtitle>
        <Modal.Body>
          <ContentNote
            editorRef={editorRef}
            dataNote={data}
            setColorValue={setColorValue}
            setMedia={setMedia}
            media={media}
            editionMode={editionMode}
          />
        </Modal.Body>
        <Modal.Footer>
          {editionMode === "read" && hasRightsToUpdateNote(data) && (
            <Button
              type="button"
              color="primary"
              variant="outline"
              onClick={handleNavigateToEditMode}
            >
              {t("collaborativewall.modal.modify", { ns: appCode })}
            </Button>
          )}
          {editionMode === "edit" && (
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={handleNavigateBack}
            >
              {t("collaborativewall.modal.cancel", { ns: appCode })}
            </Button>
          )}
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleSaveNote}
          >
            {editionMode === "edit"
              ? t("collaborativewall.modal.modify")
              : t("collaborativewall.modal.close")}
          </Button>
        </Modal.Footer>
      </Modal>,
      document.getElementById("portal") as HTMLElement,
    )
  ) : (
    <p>{t("collaborativewall.note.notfound", { ns: appCode })}</p>
  );
};
