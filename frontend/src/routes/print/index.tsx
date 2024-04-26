import { useEffect } from "react";

import { Card, Heading } from "@edifice-ui/react";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs, useParams } from "react-router-dom";

import { NoteProps } from "~/models/notes";
import {
  notesQueryOptions,
  useWallWithNotes,
  wallQueryOptions,
} from "~/services/queries";

import { Editor } from "@edifice-ui/editor";
import { backgroundColors, backgroundImages, wallConfig } from "~/config";
import { ShowMediaType } from "~/features/collaborative-wall/components/show-media-type";
import { CollaborativeWallProps } from "~/models/wall";
import "../collaborative-wall/index.css";
// import "./index.css";
import styles from "./print.module.css";

export const wallLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { wallId } = params;

    const queryWall = wallQueryOptions(wallId as string);
    const queryNotes = notesQueryOptions(wallId as string);

    const [wall, notes] = await Promise.all([
      queryClient.ensureQueryData(queryWall),
      queryClient.ensureQueryData(queryNotes),
    ]);

    if (!wall || !notes) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { wall, notes };
  };

export const CollaborativeWall = () => {
  const params = useParams();
  const queries = useWallWithNotes(params.wallId!);
  const wall = queries.data[0] as CollaborativeWallProps;
  const notes = queries.data[1] as NoteProps[];

  useEffect(() => {
    // Use setTimeout to update the message after 2000 milliseconds (2 seconds)
    const timeoutId = setTimeout(() => window.print(), 1000);

    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array ensures the effect runs only once

  return (
    <div className={styles["print-full-page"]}>
      <div className={styles["transform-wrapper-print"]}>
        <div
          className={styles["transform-component-print"]}
          style={{
            transform: `scale(${1000 / wallConfig.WIDTH_WALL})`,
          }}
        >
          <div
            style={{
              height: wallConfig.HEIGHT_WALL,
              width: wallConfig.WIDTH_WALL,
              background: `linear-gradient(${wall?.background.color ?? backgroundColors[0]})`,
            }}
          >
            <div
              style={{
                backgroundImage: `url(${import.meta.env.PROD ? `/collaborativewall/public/${wall?.background.path ?? backgroundImages[0]}` : `/${wall?.background.path ?? backgroundImages[0]}`}`,
                width: "100%",
                height: "100%",
              }}
            >
              {notes
                ?.sort(
                  (a: NoteProps, b: NoteProps) =>
                    (a.modified?.$date ?? 0) - (b.modified?.$date ?? 0),
                )
                .map((note: NoteProps, i: number) => {
                  return (
                    <div
                      style={
                        {
                          borderRadius: "1.2rem",
                          zIndex: i,
                          position: "absolute",
                          backgroundColor: note.color?.[0],
                          transform: `translate(${note.x}px, ${note.y}px)`,
                        } as React.CSSProperties
                      }
                    >
                      <Card className="note" isSelectable={false}>
                        <Card.Body>
                          {note.media?.url && (
                            <ShowMediaType media={note.media} />
                          )}
                          <div
                            style={{
                              maxHeight: note.media?.url ? "302px" : "264px",
                              overflow: "hidden",
                            }}
                          >
                            <Editor
                              content={note.content}
                              mode="read"
                              toolbar="none"
                              variant="ghost"
                            ></Editor>
                          </div>
                        </Card.Body>
                        <Card.Footer>
                          <Card.Text>{note.owner?.displayName}</Card.Text>
                        </Card.Footer>
                      </Card>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Heading className="my-16">{wall?.name}</Heading>
        {wall?.description}
      </div>
    </div>
  );
};
