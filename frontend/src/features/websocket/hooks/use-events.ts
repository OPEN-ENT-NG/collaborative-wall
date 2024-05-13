import { useUser } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useHasFocus } from "~/hooks/use-document-focus";
import {
  deleteNoteQueryData,
  notesQueryOptions,
  updateData,
  updateNoteQueryData,
  updateWallQueryData,
  useWall,
} from "~/services/queries";
import { useHistoryStore } from "~/store/history/store";
import { useWebsocketStore } from "~/store/websocket/store";

export const useEvents = () => {
  const queryClient = useQueryClient();
  const focus = useHasFocus();

  const { wall } = useWall();
  const { user } = useUser();
  const { setHistory } = useHistoryStore();

  const {
    subscribe,
    queryForMetadata,
    disconnect,
    setResourceId,
    setConnectedUsers,
    setMoveUsers,
    setMaxConnectedUsers,
    setIsVisible,
  } = useWebsocketStore(
    useShallow((state) => ({
      subscribe: state.subscribe,
      queryForMetadata: state.queryForMetadata,
      disconnect: state.disconnect,
      setResourceId: state.setResourceId,
      setConnectedUsers: state.setConnectedUsers,
      setMoveUsers: state.setMoveUsers,
      setMaxConnectedUsers: state.setMaxConnectedUsers,
      setIsVisible: state.setIsVisible,
    })),
  );

  useEffect(() => {
    if (focus) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  useEffect(() => {
    setResourceId(wall?._id as string);

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
          updateWallQueryData(queryClient, event.wall);
          break;
        }
        case "noteAdded": {
          if (user?.userId === event.userId) {
            setHistory({
              type: "create",
              item: event.note,
              ...otherProps,
            });
          }
          queryClient.invalidateQueries({
            queryKey: notesQueryOptions(wall?._id as string).queryKey,
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
          updateNoteQueryData(queryClient, {
            ...event.note,
            wallid: event.wallId,
          });
          break;
        }
        case "noteUpdated": {
          // if media is missing => it means that it has been deleted
          if (!event.note.media) event.note.media = null;

          updateData(queryClient, { ...event.note, idwall: event.wallId });

          if (user?.userId === event.userId) {
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
          }
          break;
        }
        case "noteDeleted": {
          if (user?.userId === event.userId) {
            setHistory({
              type: "delete",
              item: event.note,
              ...otherProps,
            });
          }
          deleteNoteQueryData(queryClient, event.note);
          break;
        }
        case "disconnection": {
          queryForMetadata();
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
