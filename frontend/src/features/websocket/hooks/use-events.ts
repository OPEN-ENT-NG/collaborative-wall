import { useUser } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { notesQueryOptions } from "~/services/queries";
import {
  updateData,
  useDeleteNoteQueryData,
  useUpdateNoteQueryData,
  useUpdateWallQueryData,
} from "~/services/queries/helpers";
import { useHistoryStore } from "~/store";
import { useWebsocketStore } from "./use-websocket-store";

export const useEvents = (id: string) => {
  const queryClient = useQueryClient();

  const updateNoteQueryData = useUpdateNoteQueryData();
  const deleteNoteQueryData = useDeleteNoteQueryData();
  const updateWallQueryData = useUpdateWallQueryData();

  const { user } = useUser();
  const { setHistory, setUpdatedNote } = useHistoryStore();

  const {
    setResourceId,
    subscribe,
    setConnectedUsers,
    setMoveUsers,
    setMaxConnectedUsers,
    disconnect,
  } = useWebsocketStore();

  useEffect(() => {
    setResourceId(id);

    const unsubscribe = subscribe((event) => {
      const { type, ...otherProps } = event;
      switch (type) {
        case "metadata": {
          setConnectedUsers(event.connectedUsers);
          setMaxConnectedUsers(event.maxConnectedUsers);
          break;
        }
        case "ping":
        case "wallDeleted":
        case "noteSelected":
        case "noteUnselected": {
          // not used
          break;
        }
        case "wallUpdate": {
          updateWallQueryData(event.wall);
          break;
        }
        case "noteAdded": {
          setHistory({
            type: "create",
            item: event.note,
            ...otherProps,
          });
          queryClient.invalidateQueries({
            queryKey: notesQueryOptions(id).queryKey,
          });
          break;
        }
        case "cursorMove": {
          if (user?.userId === event.userId) return;

          setMoveUsers({
            id: event.userId,
            x: event.move[0].x,
            y: event.move[0].y,
          });
          break;
        }
        case "noteEditionStarted":
        case "noteEditionEnded": {
          //TODO
          break;
        }
        case "noteMoved": {
          setUpdatedNote({
            activeId: event.note._id,
            x: event.note.x,
            y: event.note.y,
            zIndex: 2,
          });
          updateNoteQueryData({ ...event.note, wallid: event.wallId });
          break;
        }
        case "noteUpdated": {
          updateData(queryClient, { ...event.note, idwall: event.wallId });
          if (
            event.oldNote.x !== event.note.x ||
            event.oldNote.y !== event.note.y
          ) {
            // note has been moved
            setHistory({
              type: "move",
              item: event.note,
              previous: {
                x: event.oldNote.x,
                y: event.oldNote.y,
              },
              next: {
                x: event.note.x,
                y: event.note.y,
              },
              ...otherProps,
            });
            setUpdatedNote({
              activeId: event.note._id,
              x: event.note.x,
              y: event.note.y,
              zIndex: 2,
            });
          } else {
            // note has been updated
            setHistory({
              type: "edit",
              item: {
                ...event.note,
                content: event.note.content,
                color: event.note.color,
                media: event.note.media,
              },
              previous: {
                x: event.oldNote.x,
                y: event.oldNote.y,
                color: event.oldNote.color,
                content: event.oldNote.content,
                media: event.oldNote.media || null,
              },
              next: {
                x: event.note.x,
                y: event.note.y,
                color: event.note.color,
                content: event.note.content,
                media: event.note.media || null,
              },
              ...otherProps,
            });
          }
          break;
        }
        case "noteDeleted": {
          setHistory({
            type: "delete",
            item: event.note,
            ...otherProps,
          });
          deleteNoteQueryData(event.note);
          break;
        }
      }
    });
    return () => {
      unsubscribe();
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
