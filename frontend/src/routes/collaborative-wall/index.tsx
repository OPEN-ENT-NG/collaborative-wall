import { lazy, useState } from "react";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  Active,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { AppHeader, Breadcrumb, Button, useOdeClient } from "@edifice-ui/react";
import { QueryClient, useQuery } from "@tanstack/react-query";
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
import { Note } from "~/components/note";
import { WhiteboardWrapper } from "~/components/whiteboard-wrapper";
import { NoteProps } from "~/models/notes";
import { notesQuery, useUpdatePosition, wallQuery } from "~/services/queries";
import { useWhiteboard } from "~/store";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);

const activationConstraint = {
  delay: 250,
  tolerance: 5,
};

export const wallLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;

    const queryWall = wallQuery(id as string);
    const queryNotes = notesQuery(id as string);

    const wall =
      queryClient.getQueryData(queryWall.queryKey) ??
      (await queryClient.fetchQuery(queryWall));
    const notes =
      queryClient.getQueryData(queryNotes.queryKey) ??
      (await queryClient.fetchQuery(queryNotes));

    console.log("test", queryClient.getQueryData(queryNotes.queryKey));

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

  const { currentApp } = useOdeClient();
  const data = useLoaderData() as any;

  const { t } = useTranslation();

  const { zoom } = useWhiteboard(
    useShallow((state) => ({
      zoom: state.zoom,
    })),
  );
  console.log({ zoom });

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const updatePosition = useUpdatePosition();

  const handleOnDragEnd = ({
    active,
    delta,
  }: {
    active: Active;
    delta: { x: number; y: number };
  }) => {
    const activeId = active.id as string;

    const findNote = notes?.find((note) => note._id === activeId);

    if (!findNote) return;

    const now = new Date();

    console.log({ now });

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

    updatePosition.mutateAsync({ id: findNote._id, note });
  };

  const { data: wall } = useQuery(wallQuery(params.id as string));
  const { data: notes } = useQuery(notesQuery(params.id as string));

  // if (updatePosition.isPending) return <LoadingScreen />;

  console.log(updatePosition.variables);

  console.log({ notes });

  return wall && notes ? (
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleOnDragEnd}
            modifiers={[snapCenterToCursor]}
          >
            {notes.map((note: NoteProps, i: number) => {
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
  ) : (
    <p>No collaborative wall found</p>
  );
};
