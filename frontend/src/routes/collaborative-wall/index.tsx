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
import { IWebApp } from "edifice-ts-client";
// @ts-ignore
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { DescriptionWall } from "~/components/description-wall";
import { Note } from "~/components/note";
import { WhiteboardWrapper } from "~/components/whiteboard-wrapper";
import { Note as NoteProps } from "~/models/notes";
import { Wall } from "~/models/wall";
import { getNotes, getWall } from "~/services/api";
import { useWhiteboard } from "~/store";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);

const activationConstraint = {
  delay: 250,
  tolerance: 5,
};

interface DataProps {
  wall: Wall;
  notes: NoteProps[];
}

export async function wallLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  const wall = await getWall(id as string);
  const notes = await getNotes(id as string);

  if (!wall) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return { wall, notes };
}

export const CollaborativeWall = () => {
  const { currentApp } = useOdeClient();
  const data = useLoaderData() as any;

  const { t } = useTranslation();
  const data = useLoaderData() as DataProps;
  const navigate = useNavigate();

  const { zoom } = useWhiteboard(
    useShallow((state) => ({
      zoom: state.zoom,
    })),
  );
  // const [openShare, setOpenShare] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // const handleCloseModal = () => setOpenShare(false);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const updateNotePosition = useWhiteboard((state) => state.updateNotePosition);

  const handleOnDragEnd = ({
    active,
    delta,
  }: {
    active: Active;
    delta: { x: number; y: number };
  }) => {
    const activeId = active.id as string;
    updateNotePosition({ activeId, x: delta.x / zoom, y: delta.y / zoom });
  };

  console.log({ data });

  return data ? (
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
        <Breadcrumb app={currentApp as IWebApp} name={data.wall.name} />
      </AppHeader>
      <div className="collaborativewall-container">
        {data.wall.description && (
          <DescriptionWall
            setIsOpen={setIsOpen}
            description={data.wall.description}
          />
        )}
        <WhiteboardWrapper data={data}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleOnDragEnd}
            modifiers={[snapCenterToCursor]}
          >
            {data.notes?.map((note: NoteProps, i: number) => {
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

        {data.wall.description && (
          <DescriptionModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            description={data.wall.description}
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
