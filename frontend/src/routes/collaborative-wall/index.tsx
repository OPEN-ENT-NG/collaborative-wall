import { lazy, useEffect, useState } from "react";

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
import { IWebApp, odeServices } from "edifice-ts-client";
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
import { NoteProps, getNotes } from "~/services/api";
import { useWhiteboard } from "~/store";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);

const activationConstraint = {
  delay: 250,
  tolerance: 5,
};

export interface CollaborativeWallProps {
  _id: string;
  name: string;
  background: string;
  created: { $date: number };
  modified: { $date: number };
  owner: {
    userId: string;
    displayName: string;
  };
  nbnotes: string;
  shared?: any[];
  description?: string;
}

export async function wallLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const collaborativeWall = odeServices
    .http()
    .get<CollaborativeWallProps>(`/collaborativewall/${id}`);

  console.log(collaborativeWall);
  if (!collaborativeWall) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return collaborativeWall;
}

export const CollaborativeWall = () => {
  const { currentApp } = useOdeClient();

  const { t } = useTranslation();
  const data = useLoaderData() as CollaborativeWallProps;
  const navigate = useNavigate();

  const { setNotes, notes, zoom } = useWhiteboard(
    useShallow((state) => ({
      notes: state.notes,
      setNotes: state.setNotes,
      zoom: state.zoom,
    })),
  );
  // const [openShare, setOpenShare] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // const handleCloseModal = () => setOpenShare(false);

  useEffect(() => {
    (async () => {
      const response = await getNotes(data._id);

      setNotes(response);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Breadcrumb app={currentApp as IWebApp} name={data.name} />
      </AppHeader>
      <div className="collaborativewall-container">
        {data?.description && (
          <DescriptionWall
            setIsOpen={setIsOpen}
            description={data?.description}
          />
        )}
        <WhiteboardWrapper data={data}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleOnDragEnd}
            modifiers={[snapCenterToCursor]}
          >
            {notes?.map((note: NoteProps, i: number) => {
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

        {data?.description && (
          <DescriptionModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            description={data?.description}
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
