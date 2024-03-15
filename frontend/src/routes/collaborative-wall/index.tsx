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
import { QueryClient, useQueries } from "@tanstack/react-query";
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
import { notesQueryOptions, wallQueryOptions } from "~/services/queries";
import { useHistoryStore, useWhiteboard } from "~/store";

import "~/styles/index.css";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);
const ShareModal = lazy(async () => await import("~/features/share-modal"));
const CreateNoteModal = lazy(
  async () => await import("~/components/create-note-modal"),
);

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

  const { query } = useLoaderData() as LoaderData;

  const sensors = useDndKit();

  const {
    openShareModal,
    isMobile,
    openCreateModal,
    openBackgroundModal,
    setIsMobile,
    setOpenShareModal,
    setIsOpenBackgroundModal,
  } = useWhiteboard(
    useShallow((state) => ({
      openShareModal: state.openShareModal,
      isMobile: state.isMobile,
      openCreateModal: state.openCreateModal,
      openBackgroundModal: state.openBackgroundModal,
      setOpenShareModal: state.setOpenShareModal,
      setIsOpenBackgroundModal: state.setIsOpenBackgroundModal,
      setIsMobile: state.setIsMobile,
    })),
  );

  useTrashedResource(params?.wallId);

  const { currentApp } = useOdeClient();

  const [
    { data: wall, isPending: isWallLoading, isError: isWallError },
    { data: notes, isPending: isNotesLoading, isError: isNotesError },
  ] = useQueries({
    queries: [
      {
        queryKey: wallQueryOptions(params.wallId as string).queryKey,
        queryFn: wallQueryOptions(params.wallId as string).queryFn,
      },
      {
        queryKey: notesQueryOptions(params.wallId as string).queryKey,
        queryFn: notesQueryOptions(params.wallId as string).queryFn,
      },
    ],
  });

  const { move } = useEditNote();
  const { updatedNote } = useHistoryStore();

  const { hasRightsToMoveNote } = useAccess();

  useEffect(() => {
    if (query) setIsMobile(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
        {wall?.description && !isMobile && (
          <DescriptionWall description={wall?.description} />
        )}
        <WhiteboardWrapper>
          <DndContext
            sensors={sensors}
            onDragEnd={move(notes as NoteProps[])}
            modifiers={[restrictToParentElement]}
          >
            {notes?.map((note: NoteProps, i: number) => {
              const isUpdated = note._id === updatedNote?.activeId;

              return (
                <Note
                  key={note._id}
                  note={{
                    ...note,
                    x: isUpdated ? updatedNote.x : note.x,
                    y: isUpdated ? updatedNote.y : note.y,
                    title: `title ${i}`,
                    zIndex: isUpdated ? 2 : 1,
                  }}
                  disabled={hasRightsToMoveNote(note)}
                  onClick={
                    !isMobile ? (id) => navigate(`note/${id}`) : undefined
                  }
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
        {openShareModal && wall && (
          <ShareModal
            isOpen={openShareModal}
            resourceId={wall._id}
            onCancel={() => setOpenShareModal(false)}
            onSuccess={() => setOpenShareModal(false)}
          />
        )}
        {openCreateModal && wall && <CreateNoteModal wallId={wall._id} />}
      </Suspense>
    </>
  );
};
