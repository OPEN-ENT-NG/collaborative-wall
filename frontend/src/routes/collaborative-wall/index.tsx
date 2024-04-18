import { Suspense, lazy, useCallback, useEffect } from "react";

import { DndContext, DragMoveEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  AppHeader,
  Breadcrumb,
  LoadingScreen,
  useOdeClient,
  useTrashedResource,
  useUser,
} from "@edifice-ui/react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useLockBodyScroll } from "@uidotdev/usehooks";
import { IWebApp } from "edifice-ts-client";
import {
  LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { Cursor } from "~/components/cursor";
import { DescriptionWall } from "~/components/description-wall";
import { EmptyScreenError } from "~/components/emptyscreen-error";
import { Note } from "~/components/note";
import { WhiteboardWrapper } from "~/components/whiteboard-wrapper";
import { AppActions } from "~/features/app-actions";
import { useConnectedUsers } from "~/features/websocket/useConnectedUsers";
import { useAccess } from "~/hooks/useAccess";
import { useDndKit } from "~/hooks/useDndKit";
import { useEditNote } from "~/hooks/useEditNote";
import { useThrottledFunction } from "~/hooks/useThrottledFunction";
import { NoteProps } from "~/models/notes";
import { UpdatedNote } from "~/models/store";
import { MoveUser } from "~/models/types";
import { CollaborativeWallProps } from "~/models/wall";
import { getWall } from "~/services/api";
import {
  notesQueryOptions,
  useWallWithNotes,
  wallQueryOptions,
} from "~/services/queries";
import {
  useDeleteNoteQueryData,
  useUpdateWallQueryData,
} from "~/services/queries/helpers";
import { useUpdateNoteQueryData } from "~/services/queries/helpers";
import { updateData } from "~/services/queries/helpers";
import { useHistoryStore, useWebsocketStore, useWhiteboard } from "~/store";
import { ConnectedUsers } from "~/store/websocket/types";

import "~/styles/index.css";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);
const UpdateModal = lazy(async () => await import("~/features/resource-modal"));
const ShareModal = lazy(async () => await import("~/features/share-modal"));
const WebsocketModal = lazy(async () => await import("~/features/websocket"));
const BackgroundModal = lazy(
  async () => await import("~/components/background-modal"),
);

interface LoaderData {
  wall: CollaborativeWallProps;
  notes: NoteProps[];
  query: string | null;
}

const renderCursors = (coUsers: ConnectedUsers[], moveUsers: MoveUser[]) => {
  if (!coUsers) return null;

  return moveUsers.map((moveUser) => {
    const user = coUsers.find((user) => user.id === moveUser.id);

    return (
      <Cursor
        key={moveUser.id}
        username={user?.name}
        point={[moveUser.x, moveUser.y]}
      />
    );
  });
};

const renderNotes = (
  notes: NoteProps[],
  updatedNote: UpdatedNote,
  numberOfNotes: number,
  hasRightsToMoveNote: (note: NoteProps) => boolean,
) =>
  notes
    ?.sort(
      (a: NoteProps, b: NoteProps) =>
        (a.modified?.$date ?? 0) - (b.modified?.$date ?? 0),
    )
    .map((note: NoteProps, i: number) => {
      const isUpdated = note._id === updatedNote?.activeId;
      return (
        <Note
          key={note._id}
          note={{
            ...note,
            x: isUpdated ? updatedNote.x : note.x,
            y: isUpdated ? updatedNote.y : note.y,
            zIndex: isUpdated ? numberOfNotes + 1 : i,
          }}
          disabled={hasRightsToMoveNote(note)}
        />
      );
    });

export const wallLoader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    const { wallId } = params;

    const queryWall = wallQueryOptions(wallId as string);
    const queryNotes = notesQueryOptions(wallId as string);

    const wall =
      queryClient.getQueryData(queryWall.queryKey) ??
      (await queryClient.fetchQuery(queryWall));
    const notes =
      queryClient.getQueryData(queryNotes.queryKey) ??
      (await queryClient.fetchQuery(queryNotes));

    const url = new URL(request.url);
    const query = url.searchParams.get("xApp");

    if (!wall || !notes) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { wall, notes, query };
  };

export const CollaborativeWall = () => {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sensors = useDndKit();

  const updateNoteQueryData = useUpdateNoteQueryData();
  const deleteNoteQueryData = useDeleteNoteQueryData();
  const updateWallQueryData = useUpdateWallQueryData();

  const { query } = useLoaderData() as LoaderData;
  const { updatedNote, setHistory, setUpdatedNote } = useHistoryStore();
  const { currentApp } = useOdeClient();
  const { user } = useUser();
  const { hasRightsToMoveNote } = useAccess();

  const [
    { data: wall, isPending: isWallLoading, isError: isWallError },
    { data: notes, isPending: isNotesLoading, isError: isNotesError },
  ] = useWallWithNotes(params.wallId!);

  const {
    openShareModal,
    openUpdateModal,
    isMobile,
    openBackgroundModal,
    setIsMobile,
    setOpenShareModal,
    setOpenUpdateModal,
    setIsOpenBackgroundModal,
    setNumberOfNotes,
    numberOfNotes,
  } = useWhiteboard(
    useShallow((state) => ({
      openShareModal: state.openShareModal,
      openUpdateModal: state.openUpdateModal,
      isMobile: state.isMobile,
      openBackgroundModal: state.openBackgroundModal,
      setOpenShareModal: state.setOpenShareModal,
      setOpenUpdateModal: state.setOpenUpdateModal,
      setIsOpenBackgroundModal: state.setIsOpenBackgroundModal,
      setIsMobile: state.setIsMobile,
      setNumberOfNotes: state.setNumberOfNotes,
      numberOfNotes: state.numberOfNotes,
    })),
  );

  const {
    setResourceId,
    openSocketModal,
    moveUsers,
    setOpenSocketModal,
    sendNoteMovedEvent,
    sendWallUpdateEvent,
    subscribe,
    setConnectedUsers,
    setMoveUsers,
    setMaxConnectedUsers,
    disconnect,
  } = useWebsocketStore();

  const [filteredUsers, numberOfUsers] = useConnectedUsers();

  useTrashedResource(params?.wallId);

  useLockBodyScroll();

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

  const { handleOnDragEnd, handleOnDragStart } = useEditNote({
    onClick: !isMobile
      ? (id: any) => navigate(`note/${id}?mode=read`)
      : undefined,
  });

  useEffect(() => {
    if (query) setIsMobile(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const callbackFnToThrottle = useCallback(
    ({ _id, left, top }: { _id: string; left: number; top: number }) => {
      sendNoteMovedEvent(_id, {
        _id,
        x: left,
        y: top,
      });
    },
    [sendNoteMovedEvent],
  );

  const { throttledFn: throttledOnMove } = useThrottledFunction<{
    _id: string;
    left: number;
    top: number;
  }>({
    callbackFn: callbackFnToThrottle,
  });

  useEffect(() => {
    if (notes) setNumberOfNotes(notes.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  if (isWallLoading && isNotesLoading) return <LoadingScreen />;

  if (isWallError || isNotesError) return <EmptyScreenError />;

  const handleOnUpdateSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: wallQueryOptions(params.wallId as string).queryKey,
    });

    if (!wall) return;
    const newWall = await getWall(wall._id);
    sendWallUpdateEvent(newWall);

    setOpenUpdateModal(false);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const _id = event.active.id.toString();
    const coordinates = event.active.rect.current.translated;
    if (coordinates) {
      throttledOnMove({ _id, ...coordinates });
    }
  };

  if (isWallLoading && isNotesLoading) return <LoadingScreen />;

  if (isWallError || isNotesError) return <EmptyScreenError />;

  return (
    <>
      {!isMobile && (
        <AppHeader
          isFullscreen
          style={{ position: "sticky" }}
          render={() => <AppActions />}
        >
          <Breadcrumb app={currentApp as IWebApp} name={wall?.name} />
        </AppHeader>
      )}

      <div className="collaborativewall-container">
        {wall?.description && !isMobile && <DescriptionWall />}

        {numberOfUsers && renderCursors(filteredUsers, moveUsers)}

        <WhiteboardWrapper>
          <DndContext
            sensors={sensors}
            onDragMove={handleDragMove}
            onDragEnd={handleOnDragEnd}
            onDragStart={handleOnDragStart}
            modifiers={[restrictToParentElement]}
          >
            {notes &&
              renderNotes(
                notes,
                updatedNote,
                numberOfNotes,
                hasRightsToMoveNote,
              )}
          </DndContext>
        </WhiteboardWrapper>

        <Outlet />
      </div>

      <Suspense fallback={<LoadingScreen />}>
        {wall?.description && <DescriptionModal />}
        {wall && (
          <BackgroundModal
            setIsOpen={setIsOpenBackgroundModal}
            isOpen={openBackgroundModal}
            wall={wall}
          />
        )}
        {openUpdateModal && wall && (
          <UpdateModal
            mode="update"
            isOpen={openUpdateModal}
            resourceId={wall._id}
            onCancel={() => setOpenUpdateModal(false)}
            onSuccess={handleOnUpdateSuccess}
          />
        )}
        {openShareModal && wall && (
          <ShareModal
            isOpen={openShareModal}
            resourceId={wall._id}
            onCancel={() => setOpenShareModal(false)}
            onSuccess={() => setOpenShareModal(false)}
          />
        )}
        {openSocketModal && (
          <WebsocketModal
            isOpen={openSocketModal}
            onClose={() => setOpenSocketModal(false)}
          />
        )}
      </Suspense>
    </>
  );
};
