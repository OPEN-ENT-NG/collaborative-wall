import { useState } from "react";

import { Button, Modal, useOdeClient } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

import { ContentNote } from "../content-note";
import { NoteMedia } from "~/models/noteMedia";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { getNote } from "~/services/api";
import { useUpdateNote } from "~/services/queries";
import { updateData } from "~/services/queries/helpers";
import { useHistoryStore } from "~/store";

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

  const updateNote = useUpdateNote();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const { setHistory } = useHistoryStore();

  const handleSaveNote = async () => {
    const note: PickedNoteProps = {
      content: data.content,
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

    navigate("..");
  };

  const handleNavigateBack = () => navigate("..");

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
          <ContentNote
            dataNote={data}
            setColorValue={setColorValue}
            setMedia={setMedia}
            media={media}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            color="tertiary"
            variant="ghost"
            onClick={handleNavigateBack}
          >
            {t("collaborativewall.modal.cancel", { ns: appCode })}
          </Button>
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={handleSaveNote}
          >
            {t("save")}
          </Button>
        </Modal.Footer>
      </Modal>,
      document.getElementById("portal") as HTMLElement,
    )
  ) : (
    <p>{t("collaborativewall.note.notfound", { ns: appCode })}</p>
  );
};
