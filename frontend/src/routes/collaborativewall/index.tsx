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
// @ts-ignore
import { AppHeader, Breadcrumb, Button, useOdeClient } from "@edifice-ui/react";
import { IWebApp } from "edifice-ts-client";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

import { Whiteboard } from "../../components/whiteboard";
import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { DescriptionWall } from "~/components/description-wall";
import { Note } from "~/components/note";
import { DEFAULT_MAP } from "~/config/default-map";
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

  const [notes, setNotes] = useState<NoteProps[]>();

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

  const handleDragStart = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNotes((prevNotes) => {
        // Trouver et mettre à jour la position de la note déplacée
        return prevNotes?.map((note) => {
          if (note.id === active.id) {
            return {
              ...note,
              // Mettre à jour x et y ici en fonction de la nouvelle position
              // Vous devrez peut-être ajuster la logique en fonction de la manière dont votre application gère les coordonnées
            };
          }
          return note;
        });
      });
    }
  };

  const handleOnDragEnd = ({
    active,
    delta,
  }: {
    active: Active;
    delta: { x: number; y: number };
  }) => {
    const activeId = active.id;
    updateNotePosition({ activeId, x: delta.x, y: delta.y });
  };

  return data?.map ? (
    <>
      <AppHeader
        isFullscreen
        render={() => (
          <>
            <Button variant="outline" leftIcon={<Print />}>
              {t("print")}
            </Button>
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
        <Whiteboard>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleOnDragEnd}
            modifiers={[snapCenterToCursor]}
            //</Whiteboard>modifiers={[restrictToWindowEdges]}
          >
            {notes?.map((note: any) => {
              return (
                <Note
                  key={note.id}
                  note={{
                    id: note.id,
                    //title: `title ${i}`,
                    content: note.content,
                    x: note.x,
                    y: note.y,
                    //zIndex: 1,
                  }}
                />
              );
            })}
          </DndContext>
        </Whiteboard>
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
