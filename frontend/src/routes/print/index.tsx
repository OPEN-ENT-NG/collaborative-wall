import { useEffect } from "react";

import { QueryClient, useQueries } from "@tanstack/react-query";
import { LoaderFunctionArgs, useParams } from "react-router-dom";

import { Note } from "~/components/note";
import {
  backgroundColors,
  backgroundImages,
  wallConfig,
} from "~/config/init-config";
import { NoteProps } from "~/models/notes";
import { notesQueryOptions, wallQueryOptions } from "~/services/queries";

import "~/styles/index.css";
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
  const [{ data: wall }, { data: notes }] = useQueries({
    queries: [
      {
        queryKey: wallQueryOptions(params.wallId as string).queryKey,
        queryFn: wallQueryOptions(params.wallId as string).queryFn,
      },
      {
        queryKey: notesQueryOptions(params.wallId as string).queryKey,
        queryFn: notesQueryOptions(params.wallId as string).queryFn,
      },
    ],
  });

  notes?.sort(
    (a: NoteProps, b: NoteProps) =>
      (a.modified?.$date ?? 0) - (b.modified?.$date ?? 0),
  );

  useEffect(() => {
    setTimeout(() => window.print(), 1000);
  }, []);

  return (
    <div className="print-full-page">
      <div className="transform-wrapper-print">
        <div
          className="transform-component-print"
          style={{
            transform: `scale(${1000 / wallConfig.WIDTH_WALL}) translate(0px, 0px)`,
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
                    <Note
                      key={note._id}
                      note={{
                        ...note,
                        x: note.x,
                        y: note.y,
                        zIndex: i,
                      }}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
