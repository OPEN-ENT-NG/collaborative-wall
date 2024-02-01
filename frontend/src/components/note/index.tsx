import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, Image } from "@edifice-ui/react";

import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { NoteProps } from "~/services/api";

export const Note = ({ note }: { note: NoteProps }) => {
  const canMoveNote = useWhiteboard((state: any) => state.canMoveNote);
  const isBoardDragging = useWhiteboard((state: any) => state.isDragging);
  //const deleteNote = useWhiteboard((state: any) => state.deleteNote);

  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: note.id,
      disabled: !canMoveNote,
    });

  const style = {
    position: "absolute",
    borderRadius: "0.8rem",
    //zIndex: isDragging ? 200 : note.zIndex,
    userSelect: (isDragging || isBoardDragging) && "none",
    top: transform?.y ?? 0,
    left: transform?.x ?? 0,
    cursor: canMoveNote ? (isDragging ? "grabbing" : "grab") : "default",
    boxShadow: isDragging
      ? "-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
      : "0 2px 6px 0px rgba(0, 0, 0, 0.15)",
  };

  const defaultImage = "/collaborativewall/public/img/wood.jpg";

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
          //zIndex: note.zIndex,
          transform: CSS.Translate.toString(transform),
        } as React.CSSProperties
      }
    >
      <Card className="note" isSelectable={false}>
        <Card.Body>
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
