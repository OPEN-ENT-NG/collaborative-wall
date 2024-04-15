import { RefObject } from "react";

import { EditorRef } from "@edifice-ui/editor";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useShallow } from "zustand/react/shallow";

import { NoteMedia } from "~/models/noteMedia";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { useWebsocketStore, useWhiteboard } from "~/store";

export type EditionMode = "read" | "edit" | "create";
export const authorizedModes: EditionMode[] = ["read", "edit", "create"];

export const useNoteModal = (
  editorRef: RefObject<EditorRef>,
  colorValue: string[],
  loadedData: NoteProps,
  media: NoteMedia | null,
) => {
  const navigate = useNavigate();

  const { wallId } = useParams();
  const { positionViewport, zoom } = useWhiteboard(
    useShallow((state) => ({
      positionViewport: state.positionViewport,
      zoom: state.zoom,
    })),
  );

  const { sendNoteAddedEvent, sendNoteUpdated } = useWebsocketStore();

  const [searchParams] = useSearchParams();

  const editionMode: EditionMode =
    (searchParams.get("mode") as EditionMode) || "create";

  const isReadMode = editionMode === "read";
  const isEditMode = editionMode === "edit";
  const isCreateMode = editionMode === "create";

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
      await sendNoteAddedEvent({
        ...note,
        actionType: "Do",
        actionId: uuid(),
      });
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

    await sendNoteUpdated({
      _id: loadedData._id,
      content: note.content,
      media: note.media,
      color: note.color,
      x: note.x,
      y: note.y,
      actionType: "Do",
      actionId: uuid(),
    });

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
