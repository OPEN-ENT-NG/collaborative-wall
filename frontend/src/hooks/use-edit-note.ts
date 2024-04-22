import { useQueryClient } from "@tanstack/react-query";
import { ID } from "edifice-ts-client";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useWebsocketStore } from "~/features/websocket/hooks/use-websocket-store";

import { notesQueryOptions } from "~/services/queries";
import { useHistoryStore, useWhiteboard } from "~/store";

export const useEditNote = () => {
  const queryClient = useQueryClient();
  const params = useParams();

  const { setUpdatedNote } = useHistoryStore();
  const { sendNoteUpdated } = useWebsocketStore();
  const { toggleCanMoveBoard } = useWhiteboard();

  const handleOnDragStart = () => toggleCanMoveBoard();

  const handleOnDragEnd = async ({
    id,
    coordinates,
  }: {
    id: ID;
    coordinates: { x: number; y: number };
  }) => {
    toggleCanMoveBoard();

    const queryNotes = notesQueryOptions(params.wallId as string);

    const notes =
      queryClient.getQueryData(queryNotes.queryKey) ??
      (await queryClient.fetchQuery(queryNotes));

    const activeId = id as string;
    const findNote = notes?.find((note) => note._id === activeId);

    if (!findNote) return;

    const position = {
      x: coordinates.x,
      y: coordinates.y,
    };

    setUpdatedNote({
      activeId: findNote._id,
      x: position.x,
      y: position.y,
      zIndex: 2,
    });
    sendNoteUpdated({
      ...findNote,
      ...position,
      actionType: "Do",
      actionId: uuid(),
    });
  };

  return { handleOnDragEnd, handleOnDragStart };
};
