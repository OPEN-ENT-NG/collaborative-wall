/* eslint-disable react-hooks/exhaustive-deps */
import { Suspense, lazy, useEffect } from "react";

import { DndContext } from "@dnd-kit/core";
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
import {
  notesQueryOptions,
  useWallWithNotes,
  wallQueryOptions,
} from "~/services/queries";
import { useHistoryStore, useWebsocketStore, useWhiteboard } from "~/store";

import "~/styles/index.css";
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
  /* const { listen } = useRealTimeService(params.wallId!);
  listen("noteAdded", "noteDeleted"); */

  const {
    isOpened,
    openSocketModal,
    startRealTime,
    stopRealTime,
    sendPing,
    setOpenSocketModal,
  } = useWebsocketStore(
    useShallow((state) => ({
      ready: state.ready,
      status: state.status,
      mode: state.mode,
      isOpened: state.isOpened,
      openSocketModal: state.openSocketModal,
      startRealTime: state.startRealTime,
      stopRealTime: state.stopRealTime,
      sendPing: state.sendPing,
      setOpenSocketModal: state.setOpenSocketModal,
    })),
  );

  useEffect(() => {
    startRealTime(wall?._id as string, true);
    return () => {
      stopRealTime();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log({ isOpened });
    if (isOpened) {
      sendPing();
    }
  }, [isOpened]);

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

  // if (notes) setNumberOfNotes(notes.length);

  const handleOnUpdateSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: wallQueryOptions(params.wallId as string).queryKey,
    });
    // "_id" | "name" | "description" | "background" | "icon"

    if (!wall) return;

    setOpenUpdateModal(false);
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
