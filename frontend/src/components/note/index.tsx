import { useDraggable } from "@dnd-kit/core";
import { Card, Image } from "@edifice-ui/react";
import { useShallow } from "zustand/react/shallow";

import { Action, State, useWhiteboard } from "../../hooks/useWhiteBoard";
import { NoteProps } from "~/services/api";

export const Note = ({ note }: { note: NoteProps }) => {
  const { zoom, canMoveNote, isBoardDragging } = useWhiteboard(
    useShallow((state: State & Action) => ({
      zoom: state.zoom,
      canMoveNote: state.canMoveNote,
      isBoardDragging: state.isDragging,
    })),
  );

  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: note._id,
      disabled: !canMoveNote,
    });

  const style = {
    position: "absolute",
    zIndex: isDragging ? 200 : note.zIndex,
    userSelect: (isDragging || isBoardDragging) && "none",
    top: (transform?.y ?? 0) / zoom,
    left: (transform?.x ?? 0) / zoom,
    cursor: canMoveNote ? (isDragging ? "grabbing" : "grab") : "default",
    boxShadow: isDragging
      ? "-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
      : "0 2px 6px 0px rgba(0, 0, 0, 0.15)",
  };

  const defaultImage = "/collaborativewall/public/img/paper.jpg";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={
        {
          ...style,
          top: note.y,
          left: note.x,
          backgroundColor: note.color?.[0],
          transform: `translate3d(${(transform?.x ?? 0) / zoom}px, ${
            (transform?.y ?? 0) / zoom
          }px, 0)`,
        } as React.CSSProperties
      }
    >
      <Card
        className={`note ${isDragging && "is-dragging"} ${canMoveNote && !isDragging && "is-grab"}`}
        isSelectable={false}
      >
        <Card.Body>
          {/* Modifier l'image lorsqu'on récupéreré une image */}
          {defaultImage && (
            <Image alt="test" ratio="16" src={defaultImage} height="120" />
          )}
          <Card.Text
            className={`text-truncate pt-16 ${defaultImage ? "text-truncate-8" : "text-truncate-12"}`}
          >
            {note.content}
          </Card.Text>
        </Card.Body>
        <Card.Footer>
          <Card.Text>{note.owner?.displayName}</Card.Text>
        </Card.Footer>
      </Card>
    </div>
  );
};
