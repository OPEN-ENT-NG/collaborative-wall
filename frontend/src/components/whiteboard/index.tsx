import { useEffect } from "react";

import { useShallow } from "zustand/react/shallow";

import { State, useWhiteboard } from "../../hooks/useWhiteBoard";

export const Whiteboard = ({ children }: any) => {
  const {
    canMoveBoard,
    setCanMoveBoard,
    setCanMoveNote,
    zoom,
    offset,
    isDragging,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    createNote,
    zoomOut,
    zoomIn,
  } = useWhiteboard(
    useShallow((state: State) => ({
      canMoveBoard: state.canMoveBoard,
      setCanMoveBoard: state.setCanMoveBoard,
      setCanMoveNote: state.setCanMoveNote,
      zoom: state.zoom,
      offset: state.offset,
      isDragging: state.isDragging,
      handleMouseDown: state.handleMouseDown,
      handleMouseUp: state.handleMouseUp,
      handleMouseMove: state.handleMouseMove,
      handleTouchStart: state.handleTouchStart,
      handleTouchMove: state.handleTouchMove,
      handleTouchEnd: state.handleTouchEnd,
      handleWheel: state.handleWheel,
      createNote: state.createNote,
      zoomOut: state.zoomOut,
      zoomIn: state.zoomIn,
    })),
  );

  const handleKeyDown = (event: KeyboardEvent) => {
    /* This is just a test but create a note with cmd + k */
    if (event.metaKey && event.key === "k") {
      createNote();
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

    if (event.ctrlKey && event.key === "-") {
      zoomOut();
    }
    if (event.ctrlKey && (event.key === "=" || event.key === "+")) {
      zoomIn();
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
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="whiteboard-container"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex: 2,
        overflow: "hidden",
        cursor: canMoveBoard ? (isDragging ? "grabbing" : "grab") : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="whiteboard"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
};
