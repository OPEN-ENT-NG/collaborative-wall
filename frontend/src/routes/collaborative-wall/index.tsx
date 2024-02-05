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
import { Print } from "@edifice-ui/icons";
import { AppHeader, Breadcrumb, Button, useOdeClient } from "@edifice-ui/react";
import { IWebApp } from "edifice-ts-client";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { Whiteboard } from "../../components/whiteboard";
import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { DescriptionWall } from "~/components/description-wall";
import { Note } from "~/components/note";
import { WhiteboardWrapper } from "~/components/whiteboard-wrapper";
import { NoteProps, getNotes } from "~/services/api";

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
  map: string;
}

export async function wallLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const response = await fetch(`/collaborativewall/${id}`);
  const collaborativeWall: CollaborativeWallProps = await response.json();

  console.log({ collaborativeWall });

  if (!response) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return collaborativeWall;
}

export const CollaborativeWall = () => {
  const { currentApp } = useOdeClient();
  const data = useLoaderData() as any;

  const { t } = useTranslation();
  const data = useLoaderData() as CollaborativeWallProps;

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
            <Button variant="outline" leftIcon={<Print />}>
              {t("print")}
            </Button>
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
                />
              );
            })}
          </DndContext>
        </Whiteboard>
        <Toolbar />
        {infoWall?.description && (
          <DescriptionModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            description={infoWall?.description}
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
