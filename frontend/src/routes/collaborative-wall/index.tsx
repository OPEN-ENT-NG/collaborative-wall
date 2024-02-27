import { Suspense, lazy, useEffect, useState } from "react";

import { DndContext } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  AppHeader,
  Breadcrumb,
  Button,
  LoadingScreen,
  useOdeClient,
  useTrashedResource,
} from "@edifice-ui/react";
import { QueryClient, useQueries } from "@tanstack/react-query";
import { IWebApp } from "edifice-ts-client";
// @ts-ignore
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { DescriptionWall } from "~/components/description-wall";
import { EmptyScreenError } from "~/components/emptyscreen-error";
import { Note } from "~/components/note";
import { WhiteboardWrapper } from "~/components/whiteboard-wrapper";
import { useDndKit } from "~/hooks/useDndKit";
import { useHasRights } from "~/hooks/useHasRights";
import { useMoveNote } from "~/hooks/useMoveNote";
import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";
import { notesQueryOptions, wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";

import "~/styles/index.css";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);
const ShareModal = lazy(async () => await import("~/features/share-modal"));

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

  const { openShareModal, setOpenShareModal, zoom, isMobile, setIsMobile } =
    useWhiteboard(
      useShallow((state) => ({
        openShareModal: state.openShareModal,
        setOpenShareModal: state.setOpenShareModal,
        zoom: state.zoom,
        isMobile: state.isMobile,
        setIsMobile: state.setIsMobile,
      })),
    );

  useTrashedResource(params?.wallId);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { currentApp } = useOdeClient();
  const { t } = useTranslation();

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

  const { updatedNote, handleOnDragEnd } = useMoveNote({ zoom, notes });

  const canShare = useHasRights({
    roles: "creator",
    rights: wall?.rights,
  });

  useEffect(() => {
    if (query) setIsMobile(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  console.count("Collab");

  if (isWallLoading && isNotesLoading) return <LoadingScreen />;

  if (isWallError || isNotesError) return <EmptyScreenError />;

  return (
    <>
      {!isMobile && (
        <AppHeader
          isFullscreen
          style={{ position: "sticky" }}
          render={() =>
            canShare ? (
              <Button variant="filled" onClick={() => setOpenShareModal(true)}>
                {t("share")}
              </Button>
            ) : null
          }
        >
          <Breadcrumb app={currentApp as IWebApp} name={wall?.name} />
        </AppHeader>
      )}
      <div className="collaborativewall-container">
        {wall?.description && !isMobile && (
          <DescriptionWall
            setIsOpen={setIsOpen}
            description={wall?.description}
          />
        )}
        <WhiteboardWrapper>
          <DndContext
            sensors={sensors}
            onDragEnd={handleOnDragEnd}
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
          <DescriptionModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            description={wall.description}
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
      </Suspense>
    </>
  );
};
