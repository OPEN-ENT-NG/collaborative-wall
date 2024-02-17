import { Suspense, lazy, useEffect, useState } from "react";

import { DndContext, Active } from "@dnd-kit/core";
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
import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";
import { updateNote } from "~/services/api";
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

  const { zoom, isMobile, setIsMobile, notes, setNotes, updateNotePosition } =
    useWhiteboard(
      useShallow((state) => ({
        zoom: state.zoom,
        notes: state.notes,
        setNotes: state.setNotes,
        updateNotePosition: state.updateNotePosition,
        isMobile: state.isMobile,
        setIsMobile: state.setIsMobile,
      })),
    );

  useTrashedResource(params?.wallId);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openShareModal, setOpenShareModal] = useState<boolean>(false);

  const { currentApp } = useOdeClient();
  const { t } = useTranslation();

  const [
    { data: wall, isPending: isWallLoading, isError: isWallError },
    { data: dataNotes, isPending: isNotesLoading, isError: isNotesError },
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

  useEffect(() => {
    if (dataNotes) setNotes(dataNotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataNotes]);

  useEffect(() => {
    if (query) setIsMobile(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleOnDragEnd = async ({
    active,
    delta,
  }: {
    active: Active;
    delta: { x: number; y: number };
  }) => {
    const activeId = active.id as string;

    const findNote = notes?.find((note) => note._id === activeId);

    if (!findNote) return;

    const note: {
      content: string;
      x: number;
      y: number;
      idwall: string;
      color: string[];
      modified?: { $date: number };
    } = {
      content: findNote.content,
      color: findNote.color as string[],
      idwall: findNote.idwall as string,
      modified: findNote.modified,
      x: Math.round(findNote.x + delta.x / zoom),
      y: Math.round(findNote.y + delta.y / zoom),
    };

    updateNotePosition({ activeId, x: delta.x / zoom, y: delta.y / zoom });

    await updateNote(note.idwall, findNote._id, note);
  };

  if (isWallLoading && isNotesLoading) return <LoadingScreen />;

  if (isWallError || isNotesError) return <EmptyScreenError />;

  return (
    <>
      {!isMobile && (
        <AppHeader
          isFullscreen
          render={() => (
            <>
              <Button variant="filled" onClick={() => setOpenShareModal(true)}>
                {t("share")}
              </Button>
            </>
          )}
        >
          <Breadcrumb app={currentApp as IWebApp} name={wall?.name} />
        </AppHeader>
      )}
      <div className="collaborativewall-container">
        {wall?.description && (
          <DescriptionWall
            setIsOpen={setIsOpen}
            description={wall?.description}
          />
        )}
        <WhiteboardWrapper>
          <DndContext sensors={sensors} onDragEnd={handleOnDragEnd}>
            {notes.map((note: NoteProps, i: number) => {
              return (
                <Note
                  key={note._id}
                  note={{
                    ...note,
                    title: `title ${i}`,
                    zIndex: note.zIndex ?? 1,
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
            description={wall?.description}
          />
        )}
      </div>
      <Suspense fallback={<LoadingScreen />}>
        {openShareModal && (
          <ShareModal
            isOpen={openShareModal}
            resourceId={wall?._id as string}
            onCancel={() => setOpenShareModal(false)}
            onSuccess={() => setOpenShareModal(false)}
          />
        )}
      </Suspense>
    </>
  );
};
