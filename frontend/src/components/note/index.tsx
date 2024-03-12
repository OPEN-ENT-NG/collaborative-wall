import { useDraggable } from "@dnd-kit/core";
import { Card } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useShallow } from "zustand/react/shallow";

import { ShowMediaType } from "../show-media-type";
import { NoteProps } from "~/models/notes";
import { notesQueryOptions, useDeleteNote } from "~/services/queries";
import { useHistoryStore, useWhiteboard } from "~/store";

export const Note = ({
  note,
  disabled,
  onClick,
}: {
  note: NoteProps;
  disabled: () => boolean;
  onClick?: (id: string) => void;
}) => {
  const queryClient = useQueryClient();
  const deleteNote = useDeleteNote();

  const { zoom, isMovingNote, isBoardDragging } = useWhiteboard(
    useShallow((state) => ({
      zoom: state.zoom,
      isMovingNote: state.canMoveNote,
      isBoardDragging: state.isDragging,
    })),
  );

  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: note._id,
      disabled: !disabled,
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
    cursor: isMovingNote ? (isDragging ? "grabbing" : "grab") : "default",
    boxShadow: isDragging
      ? "-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
      : "0 2px 6px 0px rgba(0, 0, 0, 0.15)",
  };

  const defaultImage = "/img/cloud.png";

  const handleClick = (noteId: string): void => {
    onClick?.(noteId);
  };

  const { setHistory } = useHistoryStore();

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
      <button
        onClick={async () => {
          await deleteNote.mutateAsync(note);

          queryClient.setQueryData(
            notesQueryOptions(note.idwall).queryKey,
            (previousNotes) => {
              return previousNotes?.filter(
                (previousNote) => previousNote._id !== note._id,
              );
            },
          );

          setHistory({
            type: "delete",
            item: note,
          });
        }}
      >
        delete
      </button>
      <Card
        className={`note ${isDragging && "is-dragging"} ${isMovingNote && !isDragging && "is-grab"}`}
        isSelectable={false}
        onClick={() => handleClick(note._id)}
      >
        <Card.Body>
          {note.media && <ShowMediaType media={note.media}></ShowMediaType>}
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
