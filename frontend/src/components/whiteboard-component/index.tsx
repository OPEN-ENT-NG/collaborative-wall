import { ReactNode, useEffect } from "react";

import { TransformComponent } from "react-zoom-pan-pinch";
import { useShallow } from "zustand/react/shallow";

import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { zoomConfig } from "~/config/init-config";
import { CollaborativeWallProps } from "~/routes/collaborative-wall";

const defaultBackground = "/public/img/cloud.png";

export const WhiteboardComponent = ({
  children,
  data,
  zoomIn,
  zoomOut,
}: {
  children: ReactNode;
  data: CollaborativeWallProps;
  zoomIn: any;
  zoomOut: any;
}) => {
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
    if (event.key === "v") {
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
  }, []);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
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
            backgroundImage: `url(${data.background ?? defaultBackground})`,
            backgroundRepeat: "repeat",
            height: "3600px",
            width: "5760px",
          }}
        >
          {children}
        </div>
      </TransformComponent>
    </>
  );
};
