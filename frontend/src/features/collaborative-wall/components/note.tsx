import { Editor } from "@edifice-ui/editor";
import { Card } from "@edifice-ui/react";
import { NodeProps } from "reactflow";
import { NoteActions } from "~/features/note-actions";
import { useWhiteboard } from "~/store";
import { ShowMediaType } from "./show-media-type";
import { useAccessStore } from "~/hooks/use-access-rights";

export const Note = ({ data }: NodeProps) => {
  const canMoveNote = useWhiteboard((state) => state.canMoveNote);
  const { hasRightsToUpdateNote } = useAccessStore();

  const style = {
    borderRadius: "12px",
  };

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
            <Editor
              content={data.note.content}
              mode="read"
              toolbar="none"
              variant="ghost"
            ></Editor>
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
