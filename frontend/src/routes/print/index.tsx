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
import { ShowMediaType } from "~/features/collaborative-wall/show-media-type";
import "../collaborative-wall/index.css";
import "./index.css";

export const wallLoader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    const { wallId } = params;

    const queryWall = wallQueryOptions(wallId as string);
    const queryNotes = notesQueryOptions(wallId as string);

    const wall =
      queryClient.getQueryData(queryWall.queryKey) ??
      (await queryClient.fetchQuery(queryWall));
    const notes =
      queryClient.getQueryData(queryNotes.queryKey) ??
      (await queryClient.fetchQuery(queryNotes));

    const url = new URL(request.url);
    const query = url.searchParams.get("xApp");

    if (!wall || !notes) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { wall, notes, query };
  };

export const CollaborativeWall = () => {
  const params = useParams();

  const [{ data: wall }, { data: notes }] = useWallWithNotes(params.wallId!);

  useEffect(() => {
    setTimeout(() => window.print(), 1000);
  }, []);

  return (
    <div className="print-full-page">
      <div className="transform-wrapper-print">
        <div
          className="transform-component-print"
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
