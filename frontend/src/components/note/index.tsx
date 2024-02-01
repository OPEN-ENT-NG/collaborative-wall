import { useDraggable } from "@dnd-kit/core";
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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="note"
      style={
        {
          ...style,
          top: note.y,
          left: note.x,
          transform: `translate3d(${(transform?.x ?? 0) / zoom}px, ${
            (transform?.y ?? 0) / zoom
          }px, 0)`,
        } as React.CSSProperties
      }
    >
      <h4>{note?.title}</h4>
      <p>{note.content}</p>
      {/* <button onClick={() => deleteNote(note._id)}>delete</button> */}
    </div>
  );
};
