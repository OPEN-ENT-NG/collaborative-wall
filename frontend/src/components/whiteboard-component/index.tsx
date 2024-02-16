import { ReactNode, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { TransformComponent } from "react-zoom-pan-pinch";
import { useShallow } from "zustand/react/shallow";

import { wallConfig, zoomConfig } from "~/config/init-config";
import { wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";

const defaultBackground = "/img/cloud.png";

export const WhiteboardComponent = ({
  children,
  zoomIn,
  zoomOut,
  canUpdate,
}: {
  children: ReactNode;
  zoomIn: (value: number) => void;
  zoomOut: (value: number) => void;
  canUpdate: boolean | undefined;
}) => {
  const params = useParams();

  const { data } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

  const { canMoveBoard, isDragging, setCanMoveBoard, setCanMoveNote } =
    useWhiteboard(
      useShallow((state) => ({
        canMoveBoard: state.canMoveBoard,
        isDragging: state.isDragging,
        setCanMoveBoard: state.setCanMoveBoard,
        setCanMoveNote: state.setCanMoveNote,
      })),
    );

  const handleKeyDown = (event: KeyboardEvent) => {
    /* This is just a test but create a note with cmd + k */
    if (event.metaKey && event.key === "k") {
      //createNote();
    }

    /* Enable moveboard when space is pressed */
    if (event.code === "Space") {
      setCanMoveBoard(true);
      setCanMoveNote(false);
    }
  };

  /* Disable moveboard when space is released */
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      setCanMoveBoard(false);
      setCanMoveNote(false);
    }
    if (canUpdate && event.key === "v") {
      setCanMoveNote(true);
      setCanMoveBoard(false);
    }
    if (event.key === "h") {
      setCanMoveBoard(true);
      setCanMoveNote(false);
    }

    if (event.key === "-") {
      zoomOut(zoomConfig.SCALE_ZOOM);
    }
    if (event.key === "=" || event.key === "+") {
      zoomIn(zoomConfig.SCALE_ZOOM);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TransformComponent
        wrapperStyle={{
          maxWidth: "100%",
          maxHeight: "calc(100vh)",
          cursor: canMoveBoard ? (isDragging ? "grabbing" : "grab") : "default",
        }}
      >
        <div
          style={{
            backgroundImage: `url(${data?.background ?? defaultBackground})`,
            height: wallConfig.HEIGHT_WALL,
            width: wallConfig.WIDTH_WALL,
          }}
        >
          {children}
        </div>
      </TransformComponent>
    </>
  );
};
