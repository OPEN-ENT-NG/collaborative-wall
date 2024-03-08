import { useDraggable } from "@dnd-kit/core";
import { Card, Image } from "@edifice-ui/react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useShallow } from "zustand/react/shallow";

import { ShowMediaType } from "../show-media-type";
import { NoteProps } from "~/models/notes";
import { useWhiteboard } from "~/store";

export const Note = ({
  note,
  onClick,
}: {
  note: NoteProps;
  onClick?: (id: string) => void;
}) => {
  const { zoom, canMoveNote, isBoardDragging } = useWhiteboard(
    useShallow((state) => ({
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

  const editor: Editor | null = useEditor({
    extensions: [StarterKit],
    content: note.content,
    editable: false,
  });

  const style = {
    position: "absolute",
    borderRadius: "0.8rem",
    zIndex: isDragging ? 200 : note.zIndex,
    userSelect: (isDragging || isBoardDragging) && "none",
    top: (transform?.y ?? 0) / zoom,
    left: (transform?.x ?? 0) / zoom,
    cursor: canMoveNote ? (isDragging ? "grabbing" : "grab") : "default",
    boxShadow: isDragging
      ? "-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
      : "0 2px 6px 0px rgba(0, 0, 0, 0.15)",
  };

  const defaultImage = "/img/cloud.png";

  const handleClick = (noteId: string): void => {
    onClick?.(noteId);
  };

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
        onClick={() => handleClick(note._id)}
      >
        <Card.Body>
          {note.media && <ShowMediaType media={note.media}></ShowMediaType>}
          {/* Modifier l'image lorsqu'on récupéreré une image */}
          {!note.media && defaultImage && (
            <Image alt="test" ratio="16" src={defaultImage} height="120" />
          )}
          <Card.Text
            className={`text-truncate ${defaultImage ? "text-truncate-8" : "text-truncate-12"}`}
          >
            <EditorContent editor={editor} />
          </Card.Text>
        </Card.Body>
        <Card.Footer>
          <Card.Text>{note.owner?.displayName}</Card.Text>
        </Card.Footer>
      </Card>
    </div>
  );
};
