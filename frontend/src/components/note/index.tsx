import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { useWhiteboard } from "../../hooks/useWhiteBoard";

export type NoteProps = {
  id: number;
  title: string;
  text: string;
  offset: { x: number; y: number };
  zIndex: number;
};

export const Note = ({ note }: { note: NoteProps }) => {
  const canMoveNote = useWhiteboard((state: any) => state.canMoveNote);
  const isBoardDragging = useWhiteboard((state: any) => state.isDragging);
  const deleteNote = useWhiteboard((state: any) => state.deleteNote);

  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: note.id,
      disabled: !canMoveNote,
    });

  const style = {
    position: "absolute",
    zIndex: isDragging ? 200 : note.zIndex,
    userSelect: (isDragging || isBoardDragging) && "none",
    top: transform?.y ?? 0,
    left: transform?.x ?? 0,
    cursor: canMoveNote ? (isDragging ? "grabbing" : "grab") : "default",
    boxShadow: isDragging
      ? "-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
      : "0 2px 6px 0px rgba(0, 0, 0, 0.15)",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="note"
      style={
        {
          ...style,
          top: note.offset.y,
          left: note.offset.x,
          zIndex: note.zIndex,
          transform: CSS.Translate.toString(transform),
        } as React.CSSProperties
      }
    >
      <h4>{note.title}</h4>
      <p>{note.text}</p>
      <button onClick={() => deleteNote(note.id)}>delete</button>
    </div>
  );
};
