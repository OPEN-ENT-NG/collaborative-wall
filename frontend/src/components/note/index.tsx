import { useEffect, useState } from "react";

import { useDraggable } from "@dnd-kit/core";
import { Card } from "@edifice-ui/react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ShowMediaType } from "../show-media-type";
import { NoteActions } from "~/features/note-actions";
import { useAccess } from "~/hooks/useAccess";
import { NoteProps } from "~/models/notes";
import { useWhiteboard } from "~/store";

export const Note = ({
  note,
  disabled,
}: {
  note: NoteProps;
  disabled?: boolean;
}) => {
  const navigate = useNavigate();
  const { hasRightsToUpdateNote } = useAccess();

  const { zoom, canMoveNote, numberOfNotes } = useWhiteboard(
    useShallow((state) => ({
      zoom: state.zoom,
      canMoveNote: state.canMoveNote,
      numberOfNotes: state.numberOfNotes,
    })),
  );

  const [isopenDropdown, setIsOpenDropdown] = useState<boolean>(false);

  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: note._id,
      disabled: !canMoveNote || !disabled,
    });

  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: `card-text small text-break text-truncate ${note.media ? "text-truncate-8" : "text-truncate-12"}`,
          },
        },
      }),
    ],
    content: note.content,
    editable: false,
  });

  useEffect(() => {
    editor?.commands.setContent(note.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  const handleClick = () => {
    if (!hasRightsToUpdateNote(note)) {
      return navigate(`note/${note._id}?mode=read`);
    }
  };

  const style = {
    position: "absolute",
    borderRadius: "12px",
    zIndex: isDragging || isopenDropdown ? numberOfNotes + 2 : note.zIndex,
    userSelect: isDragging && "none",
    top: (transform?.y ?? 0) / zoom,
    left: (transform?.x ?? 0) / zoom,
    boxShadow: isDragging
      ? "-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
      : "0 2px 6px 0px rgba(0, 0, 0, 0.15)",
  };

  const classes = clsx("note", {
    "is-dragging": isDragging,
    "is-grab": disabled && !isDragging && !canMoveNote,
  });

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
      className="card-container"
    >
      <Card className={classes} isSelectable={false} onClick={handleClick}>
        <Card.Body>
          {note.media?.url && <ShowMediaType media={note.media} />}
          <div
            style={{
              maxHeight: note.media?.url ? "302px" : "264px",
              overflow: "hidden",
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </Card.Body>
        <Card.Footer>
          <Card.Text>{note.owner?.displayName}</Card.Text>
        </Card.Footer>
      </Card>
      {canMoveNote && hasRightsToUpdateNote(note) && (
        <NoteActions
          note={note}
          setIsOpenDropdown={setIsOpenDropdown}
        ></NoteActions>
      )}
    </div>
  );
};
