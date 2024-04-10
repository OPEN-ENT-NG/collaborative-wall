/* eslint-disable react-hooks/exhaustive-deps */
import { Suspense, lazy, useEffect } from "react";

import { DndContext, DragMoveEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  AppHeader,
  Breadcrumb,
  LoadingScreen,
  useOdeClient,
  useTrashedResource,
} from "@edifice-ui/react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { IWebApp } from "edifice-ts-client";
import {
  LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import BackgroundModal from "~/components/background-modal";
import { DescriptionWall } from "~/components/description-wall";
import { EmptyScreenError } from "~/components/emptyscreen-error";
import { Note } from "~/components/note";
import { WhiteboardWrapper } from "~/components/whiteboard-wrapper";
import { AppActions } from "~/features/app-actions";
import { useAccess } from "~/hooks/useAccess";
import { useDndKit } from "~/hooks/useDndKit";
import { useEditNote } from "~/hooks/useEditNote";
import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";
import { getWall } from "~/services/api";
import {
  noteQueryKey,
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
import "~/styles/index.css";
import { throttle } from "~/utils/throttle";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);

const UpdateModal = lazy(async () => await import("~/features/resource-modal"));
const ShareModal = lazy(async () => await import("~/features/share-modal"));
const WebsocketModal = lazy(async () => await import("~/features/websocket"));

interface LoaderData {
  wall: CollaborativeWallProps;
  notes: NoteProps[];
  query: string | null;
}

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

  const { query } = useLoaderData() as LoaderData;

  const sensors = useDndKit();
  const { setHistory } = useHistoryStore();

  const {
    openShareModal,
    openUpdateModal,
    isMobile,
    openBackgroundModal,
    setIsMobile,
    setOpenShareModal,
    setOpenUpdateModal,
    setIsOpenBackgroundModal,
    // setNumberOfNotes,
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
      // setNumberOfNotes: state.setNumberOfNotes,
      numberOfNotes: state.numberOfNotes,
    })),
  );

  const {
    openSocketModal,
    startRealTime,
    stopRealTime,
    setOpenSocketModal,
    sendNoteMovedEvent,
    sendWallUpdateEvent,
    listen,
  } = useWebsocketStore(
    useShallow((state) => ({
      mode: state.mode,
      openSocketModal: state.openSocketModal,
      startRealTime: state.startRealTime,
      stopRealTime: state.stopRealTime,
      setOpenSocketModal: state.setOpenSocketModal,
      sendNoteMovedEvent: state.sendNoteMovedEvent,
      sendWallUpdateEvent: state.sendWallUpdateEvent,
      listen: state.listen,
    })),
  );
  const updateNoteQueryData = useUpdateNoteQueryData();
  const deleteNoteQueryData = useDeleteNoteQueryData();
  const updateWallQueryData = useUpdateWallQueryData();
  useEffect(() => {
    startRealTime(wall?._id as string, true);
    const unsubscribe = listen((event) => {
      switch (event.type) {
        case "metadata":
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
          });
          queryClient.invalidateQueries({ queryKey: [noteQueryKey()] });
          break;
        }
        case "cursorMove":
        case "noteEditionStarted":
        case "noteEditionEnded": {
          //TODO
          break;
        }
        case "noteMoved": {
          updateNoteQueryData({ ...event.note, wallid: event.wallId });
          break;
        }
        case "noteUpdated": {
          updateData(queryClient, { ...event.note, idwall: event.wallId });
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
          });
          break;
        }
        case "noteDeleted": {
          setHistory({
            type: "delete",
            item: event.note,
          });
          deleteNoteQueryData(event.note);
          break;
        }
      }
    });
    return () => {
      unsubscribe();
      stopRealTime();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useTrashedResource(params?.wallId);

  const { currentApp } = useOdeClient();

  const [
    { data: wall, isPending: isWallLoading, isError: isWallError },
    { data: notes, isPending: isNotesLoading, isError: isNotesError },
  ] = useWallWithNotes(params.wallId!);

  const { handleOnDragEnd, handleOnDragStart } = useEditNote({
    onClick: !isMobile
      ? (id: any) => navigate(`note/${id}?mode=read`)
      : undefined,
  });
  const { updatedNote } = useHistoryStore();

  const { hasRightsToMoveNote } = useAccess();

  useEffect(() => {
    if (query) setIsMobile(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
  // throttle drag and drop
  const throlledDrag = throttle<{ _id: string; left: number; top: number }>(
    ({ _id, left, top }) => {
      sendNoteMovedEvent(_id, {
        _id,
        x: left,
        y: top,
      });
    },
    100,
  );
  const handleDragMove = (event: DragMoveEvent) => {
    const _id = event.active.id.toString();
    const coordinates = event.active.rect.current.translated;
    if (coordinates) {
      throlledDrag({ _id, ...coordinates });
    }
  };

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
        {wall?.description && !isMobile && (
          <DescriptionWall description={wall?.description} />
        )}
        <WhiteboardWrapper>
          <DndContext
            sensors={sensors}
            onDragMove={handleDragMove}
            onDragEnd={handleOnDragEnd}
            onDragStart={handleOnDragStart}
            modifiers={[restrictToParentElement]}
          >
            {notes
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
              })}
          </DndContext>
        </WhiteboardWrapper>

        <Outlet />

        {wall?.description && (
          <DescriptionModal description={wall.description} />
        )}
        {wall && (
          <BackgroundModal
            setIsOpen={setIsOpenBackgroundModal}
            isOpen={openBackgroundModal}
            wall={wall}
          />
        )}
      </div>
      <Suspense fallback={<LoadingScreen />}>
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
