import { RefObject, useState } from "react";

import { EditorRef } from "@edifice-ui/editor";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { NoteMedia } from "~/models/noteMedia";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { useCreateNote, useUpdateNote } from "~/services/queries";
import { updateData } from "~/services/queries/helpers";
import { useHistoryStore, useWhiteboard } from "~/store";

export type EditionMode = "read" | "edit" | "create";
export const authorizedModes: EditionMode[] = ["read", "edit", "create"];

export const useNoteModal = (
  editorRef: RefObject<EditorRef>,
  colorValue: string[],
  loadedData: NoteProps,
  media: NoteMedia | null,
) => {
  const [cancelConfirmModal, setCancelConfirmModal] = useState(false);

  const navigate = useNavigate();

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const queryClient = useQueryClient();
  const { setHistory } = useHistoryStore();

  const { wallId } = useParams();
  const [searchParams] = useSearchParams();
  const editionMode: EditionMode =
    (searchParams.get("mode") as EditionMode) || "create";

  const { positionViewport, zoom } = useWhiteboard(
    useShallow((state) => ({
      positionViewport: state.positionViewport,
      zoom: state.zoom,
    })),
  );

  const isReadMode = editionMode === "read";
  const isEditMode = editionMode === "edit";
  const isCreateMode = editionMode === "create";

  const navigateBack = () => navigate("..");

  const handleCreateNote = async () => {
    if (!wallId) {
      throw Error("Wall id is undefined");
    }

    const note: PickedNoteProps = {
      content: editorRef.current?.getContent("plain") as string,
      color: colorValue,
      idwall: wallId,
      media: media,
      x: Math.trunc((positionViewport.x * -1 + window.innerWidth / 2) / zoom),
      y: Math.trunc((positionViewport.y * -1 + window.innerHeight / 2) / zoom),
    };

    try {
      const response = await createNote.mutateAsync(note);

      const { status, wall } = response;

      if (status === "ok") {
        const size = wall.length;
        const note = wall[size - 1];

        setHistory({
          type: "create",
          item: note,
        });
      }

      navigateBack();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveNote = async () => {
    const note: PickedNoteProps = {
      content: editorRef.current?.getContent("plain") as string,
      color: colorValue,
      idwall: loadedData.idwall as string,
      media: media || null,
      modified: loadedData.modified,
      x: loadedData.x,
      y: loadedData.y,
    };

    await updateNote.mutateAsync(
      { id: loadedData._id, note },
      {
        onSuccess: async (responseData) => {
          const { status, note: updatedNote } = responseData;

          if (status !== "ok") return;

          updateData(queryClient, updatedNote);

          setHistory({
            type: "edit",
            item: {
              ...updatedNote,
              content: loadedData.content,
              color: loadedData.color,
              media: loadedData.media,
            },
            previous: {
              x: loadedData.x,
              y: loadedData.y,
              color: loadedData.color,
              content: loadedData.content,
              media: loadedData.media || null,
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

    navigateBack();
  };

  const handleNavigateToEditMode = () => {
    navigate(`../note/${loadedData._id}?mode=edit`);
  };

  const handleModalClose = () => {
    // TODO check if note has changed
    const changes = true;

    if (!isReadMode() && changes) {
      setCancelConfirmModal(true);
    } else {
      navigateBack();
    }
  };

  const handleCancelModalClose = () => {
    setCancelConfirmModal(false);
  };

  const handleCancelModalConfirm = () => {
    navigateBack();
  };

  return {
    cancelConfirmModal,
    editionMode,
    isReadMode,
    isEditMode,
    isCreateMode,
    handleNavigateToEditMode,
    handleCreateNote,
    handleSaveNote,
    handleModalClose,
    handleCancelModalClose,
    handleCancelModalConfirm,
  };
};
