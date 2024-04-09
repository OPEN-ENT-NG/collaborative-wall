import { RefObject, useEffect } from "react";

import { EditorRef } from "@edifice-ui/editor";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

// import { useRealTimeService } from "~/hooks/useRealTimeService";
import { NoteMedia } from "~/models/noteMedia";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { useUpdateNote } from "~/services/queries";
import { updateData } from "~/services/queries/helpers";
import { useHistoryStore, useWebsocketStore, useWhiteboard } from "~/store";

export type EditionMode = "read" | "edit" | "create";
export const authorizedModes: EditionMode[] = ["read", "edit", "create"];

export const useNoteModal = (
  editorRef: RefObject<EditorRef>,
  colorValue: string[],
  loadedData: NoteProps,
  media: NoteMedia | null,
) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { wallId } = useParams();
  const { setHistory } = useHistoryStore();
  const { positionViewport, zoom } = useWhiteboard(
    useShallow((state) => ({
      positionViewport: state.positionViewport,
      zoom: state.zoom,
    })),
  );

  const {
    sendNoteAddedEvent,
    sendNoteTextUpdatedEvent,
    sendNoteImageUpdatedEvent,
  } = useWebsocketStore(
    useShallow((state) => ({
      sendNoteAddedEvent: state.sendNoteAddedEvent,
      sendNoteTextUpdatedEvent: state.sendNoteTextUpdatedEvent,
      sendNoteImageUpdatedEvent: state.sendNoteImageUpdatedEvent,
    })),
  );

  const updateNote = useUpdateNote();
  /* const { createNote, updateNote } = useRealTimeService(wallId!);
   */

  const [searchParams] = useSearchParams();

  const editionMode: EditionMode =
    (searchParams.get("mode") as EditionMode) || "create";

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

  const isReadMode = () => editionMode === "read";
  const isEditMode = () => editionMode === "edit";
  const isCreateMode = () => editionMode === "create";

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
      await sendNoteAddedEvent(note);
      handleNavigateBack();
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

          await Promise.all([
            sendNoteTextUpdatedEvent({ ...note, _id: loadedData._id }),
            sendNoteImageUpdatedEvent({ ...note, _id: loadedData._id }),
          ]);

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

    handleNavigateBack();
  };

  const handleNavigateBack = () => navigate("..");

  const handleNavigateToEditMode = () => {
    navigate(`../note/${loadedData._id}?mode=edit`);
  };

  return {
    editionMode,
    isReadMode,
    isEditMode,
    isCreateMode,
    handleNavigateBack,
    handleNavigateToEditMode,
    handleCreateNote,
    handleSaveNote,
  };
};
