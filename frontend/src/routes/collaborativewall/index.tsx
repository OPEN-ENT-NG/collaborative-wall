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
// @ts-ignore
import { AppHeader, Breadcrumb, Button, useOdeClient } from "@edifice-ui/react";
import { IWebApp } from "edifice-ts-client";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { DescriptionWall } from "~/components/description-wall";
import { Note } from "~/components/note";
import { WhiteboardWrapper } from "~/components/whiteboardWrapper";
import { DEFAULT_MAP } from "~/config/default-map";
import { NoteProps, getNotes } from "~/services/api";

const DescriptionModal = lazy(
  async () => await import("~/components/description-modal"),
);

const activationConstraint = {
  delay: 0,
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
  description?: string;
}

export async function wallLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const response = await fetch(`/collaborativewall/${id}`);
  const collaborativeWall = await response.json();

  if (!response) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return collaborativeWall.map
    ? collaborativeWall
    : {
        ...collaborativeWall,
        map: DEFAULT_MAP(collaborativeWall?.name),
      };
}

export const CollaborativeWall = () => {
  const { currentApp } = useOdeClient();

  const { t } = useTranslation();
  const data = useLoaderData() as CollaborativeWallProps;

  const { setNotes, notes, zoom } = useWhiteboard((state) => ({
    notes: state.notes,
    setNotes: state.setNotes,
    zoom: state.zoom,
  }));

  useEffect(() => {
    (async () => {
      const response = await getNotes(data._id);
      setNotes(response);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isOpen, setIsOpen] = useState<boolean>(false);

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
    const activeId = active.id;
    updateNotePosition({ activeId, x: delta.x / zoom, y: delta.y / zoom });
  };

  return data?.map ? (
    <>
      <AppHeader
        isFullscreen
        render={() => (
          <>
            <Button variant="filled">{t("share")}</Button>
          </>
        )}
      >
        <Breadcrumb app={currentApp as IWebApp} name={data.name} />
      </AppHeader>
      {data?.description && (
        <DescriptionWall
          setIsOpen={setIsOpen}
          description={data?.description}
        />
      )}
      <div className="collaborative-wall-container">
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
        </WhiteboardWrapper>
        {data?.description && (
          <DescriptionModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            description={data?.description}
          />
        )}
      </div>
    </>
  ) : (
    <p>No collaborative wall found</p>
  );
};
