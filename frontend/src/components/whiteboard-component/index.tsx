import { ReactNode } from "react";

import { useHotkeys } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { TransformComponent } from "react-zoom-pan-pinch";
import { useShallow } from "zustand/react/shallow";

import {
  backgroundColors,
  backgroundImages,
  wallConfig,
  zoomConfig,
} from "~/config/init-config";
import { wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";

export const WhiteboardComponent = ({
  children,
  zoomIn,
  zoomOut,
}: {
  children: ReactNode;
  zoomIn: (value: number) => void;
  zoomOut: (value: number) => void;
}) => {
  const params = useParams();

  const { data } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

  const {
    canMoveBoard,
    canMoveNote,
    isDragging,
    setCanMoveBoard,
    setCanMoveNote,
  } = useWhiteboard(
    useShallow((state) => ({
      canMoveBoard: state.canMoveBoard,
      isDragging: state.isDragging,
      canMoveNote: state.canMoveNote,
      setCanMoveBoard: state.setCanMoveBoard,
      setCanMoveNote: state.setCanMoveNote,
    })),
  );

  // hot keys for moving and zooming board
  useHotkeys([
    ["Space", () => setCanMoveNote(!canMoveNote)],
    [
      "V",
      () => {
        setCanMoveNote(true);
        setCanMoveBoard(false);
      },
    ],
    [
      "H",
      () => {
        setCanMoveNote(false);
        setCanMoveBoard(true);
      },
    ],
    ["-", () => zoomOut(zoomConfig.SCALE_ZOOM)],
    ["+", () => zoomIn(zoomConfig.SCALE_ZOOM)],
    ["=", () => zoomIn(zoomConfig.SCALE_ZOOM)],
  ]);

  return (
    <>
      <TransformComponent
        wrapperStyle={{
          maxWidth: "100%",
          maxHeight: "calc(100vh)",
          cursor: canMoveBoard ? (isDragging ? "grabbing" : "grab") : "default",
          backgroundColor: "black",
        }}
      >
        <div
          style={{
            height: wallConfig.HEIGHT_WALL,
            width: wallConfig.WIDTH_WALL,
            background: `linear-gradient(${data?.background.color ?? backgroundColors[0]})`,
          }}
        >
          <div
            style={{
              backgroundImage: `url(${import.meta.env.PROD ? `/collaborativewall/public/${data?.background.path ?? backgroundImages[0]}` : `/${data?.background.path ?? backgroundImages[0]}`}`,
              width: "100%",
              height: "100%",
            }}
          ></div>
          {children}
        </div>
      </TransformComponent>
    </>
  );
};
