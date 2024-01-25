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
import { WhiteboardWrapper } from "~/components/whiteboardWrapper";
import { DEFAULT_MAP } from "~/config/default-map";

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

export async function mapLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  const response = await fetch(`/collaborativewall/${id}/notes`);
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
      <div className="collaborative-wall-container">
        <WhiteboardWrapper data={data}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            //onDragStart={handleDragStart}
            onDragEnd={handleOnDragEnd}
            modifiers={[snapCenterToCursor]}
            //</Whiteboard>modifiers={[restrictToWindowEdges]}
          >
            {data.map((note: any, i: number) => {
              return (
                <Note
                  key={note._id}
                  note={{
                    id: note._id,
                    title: `title ${i}`,
                    text: note.content,
                    offset: {
                      x: note.x,
                      y: note.y,
                    },
                    zIndex: 1,
                  }}
                />
              );
            })}
          </DndContext>
        </WhiteboardWrapper>
      </div>
    </>
  ) : (
    <p>No mindmap found</p>
  );
};
