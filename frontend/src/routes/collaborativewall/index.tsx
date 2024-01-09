import { useEffect, useState } from "react";

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
import { useOdeClient, Breadcrumb, Button, AppHeader } from "@edifice-ui/react";
// @ts-ignore
import { IWebApp } from "edifice-ts-client";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";

import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { Note } from "~/components/note";
import { Toolbar } from "~/components/toolbar";
import { Whiteboard } from "~/components/whiteboard";
import { DEFAULT_MAP } from "~/config/default-map";
import { NoteProps, getNotes } from "~/services/api";

const defaultBackgroundImage = "/collaborativewall/public/img/default.jpg";

const activationConstraint = {
  delay: 250,
  tolerance: 5,
};

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
  const data = useLoaderData() as any;

  const { appCode, currentApp } = useOdeClient();
  const { t } = useTranslation();

  const [notes, setNotes] = useState<NoteProps[]>();

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

  /* const handleDragStart = (event) => {
    const { active } = event;
  }; */

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

  console.log(data);

  return data?.map ? (
    <>
      <AppHeader
        isFullscreen
        render={() => (
          <>
            <Button variant="outline">
              {t("collaborativewall.share", { ns: appCode })}
            </Button>
          </>
        )}
      >
        <Breadcrumb app={currentApp as IWebApp} name={data.name} />
      </AppHeader>
      <div
        className="collaborative-wall-container"
        style={{
          backgroundImage: `url(${data?.background ?? defaultBackgroundImage})`,
        }}
      >
        <Whiteboard>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            //onDragStart={handleDragStart}
            onDragEnd={handleOnDragEnd}
            modifiers={[snapCenterToCursor]}
            //</Whiteboard>modifiers={[restrictToWindowEdges]}
          >
            {notes &&
              notes.map((note: NoteProps) => {
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
        <Toolbar />
      </div>
    </>
  ) : (
    <p>No mindmap found</p>
  );
};
