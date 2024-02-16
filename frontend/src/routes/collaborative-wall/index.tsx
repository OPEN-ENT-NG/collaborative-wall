import { lazy, useEffect, useState } from "react";

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
  useNavigate,
  useParams,
} from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { DescriptionWall } from "~/components/description-wall";
import EmptyScreenError from "~/components/error";
import { Note } from "~/components/note";
import { WhiteboardWrapper } from "~/components/whiteboard-wrapper";
import { useDndKit } from "~/hooks/useDndKit";
import { NoteProps } from "~/models/notes";
import { updateNote } from "~/services/api";
import { notesQueryOptions, wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";

import "~/styles/index.css";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);

export const wallLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { wallId } = params;

    const queryWall = wallQueryOptions(wallId as string);
    const queryNotes = notesQueryOptions(wallId as string);

    const wall =
      queryClient.getQueryData(queryWall.queryKey) ??
      (await queryClient.fetchQuery(queryWall));
    const notes =
      queryClient.getQueryData(queryNotes.queryKey) ??
      (await queryClient.fetchQuery(queryNotes));

    if (!wall) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { wall, notes };
  };

export const CollaborativeWall = () => {
  const params = useParams();
  const navigate = useNavigate();

  const sensors = useDndKit();

  /* const zoom = useWhiteboard((state) => state.zoom); */

  const { zoom, notes, setNotes, updateNotePosition } = useWhiteboard(
    useShallow((state) => ({
      zoom: state.zoom,
      notes: state.notes,
      setNotes: state.setNotes,
      updateNotePosition: state.updateNotePosition,
    })),
  );

  // const updatePositionMutation = useUpdateNote();

  useTrashedResource(params?.wallId);

  const [isOpen, setIsOpen] = useState<boolean>(false);

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
    wall &&
    notes && (
      <>
        <AppHeader
          isFullscreen
          render={() => (
            <>
              <Button variant="filled" /* onClick={() => setOpenShare(true)} */>
                {t("share")}
              </Button>
            </>
          )}
        >
          <Breadcrumb app={currentApp as IWebApp} name={wall.name} />
        </AppHeader>
        <div className="collaborativewall-container">
          {wall.description && (
            <DescriptionWall
              setIsOpen={setIsOpen}
              description={wall.description}
            />
          )}
          <WhiteboardWrapper data={wall}>
            <DndContext sensors={sensors} onDragEnd={handleOnDragEnd}>
              {notes.map((note: NoteProps, i: number) => {
                /* if (
                  updatePositionMutation.isPending &&
                  note._id === updatePositionMutation.variables?.id
                ) {
                  return (
                    <Note
                      key={note._id}
                      note={{
                        ...note,
                        ...updatePositionMutation.variables.note,
                      }}
                      onClick={(id) => navigate(`note/${id}`)}
                    />
                  );
                } */

                return (
                  <Note
                    key={note._id}
                    note={{
                      ...note,
                      title: `title ${i}`,
                      zIndex: note.zIndex ?? 1,
                    }}
                    onClick={(id) => navigate(`note/${id}`)}
                  />
                );
              })}
            </DndContext>
          </WhiteboardWrapper>

          <Outlet />

          {wall.description && (
            <DescriptionModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              description={wall.description}
            />
          )}
        </div>
        {/* <Suspense fallback={<LoadingScreen />}>
        {openShare && data && (
          <ShareModal
            isOpen={openShare}
            resourceId={data._id}
            onCancel={handleCloseModal}
            onSuccess={handleCloseModal}
          />
        )}
      </Suspense> */}
      </>
    )
  );
};
