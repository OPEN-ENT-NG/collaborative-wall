import { Card } from "@edifice-ui/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { NodeProps } from "reactflow";
import { NoteActions } from "~/features/note-actions";
import { useAccessStore } from "~/hooks/use-access-rights";
import { useWhiteboard } from "~/store";
import { ShowMediaType } from "./show-media-type";

export const Note = ({ data }: NodeProps) => {
  const canMoveNote = useWhiteboard((state) => state.canMoveNote);
  const { hasRightsToUpdateNote } = useAccessStore();

  const style = {
    borderRadius: "12px",
  };

  const extensions = [StarterKit];

  const editor = useEditor({
    extensions,
    content: data.note.content,
  });

  useEffect(() => {
    editor?.commands.setContent(data.note.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div
      style={
        {
          ...style,
          boxShadow: "0 0.2rem 0.6em rgba(0, 0, 0, 0.15)",
          overflow: "clip",
          backgroundColor: data.note.color?.[0],
        } as React.CSSProperties
      }
      className="card-container"
    >
      <Card className="note" isSelectable={false}>
        <Card.Body>
          {data.note.media?.url && <ShowMediaType media={data.note.media} />}
          <div
            style={{
              maxHeight: data.note.media?.url ? "302px" : "264px",
              overflow: "hidden",
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </Card.Body>
        <Card.Footer>
          <Card.Text>{data.note.owner?.displayName}</Card.Text>
        </Card.Footer>
      </Card>
      {canMoveNote && hasRightsToUpdateNote(data.note) && (
        <NoteActions note={data.note}></NoteActions>
      )}
    </div>
  );
};
