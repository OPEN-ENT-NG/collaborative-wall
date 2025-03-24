import { Card } from '@edifice.io/react';
import { useEffect } from 'react';
import { NodeProps } from 'reactflow';
import { NoteActions } from '~/features/Note/components/NoteActions';
import { useAccessStore } from '~/hooks/useAccessStore';
import { useWhiteboardStore } from '~/store';
import { NoteMedia } from './NoteMedia';
import { EditorContent, StarterKit, useEditor } from '@edifice.io/react/editor';

export const Note = ({ data }: NodeProps) => {
  const canMoveNote = useWhiteboardStore((state) => state.canMoveNote);
  const isMobile = useWhiteboardStore((state) => state.isMobile);
  const { hasRightsToUpdateNote } = useAccessStore();

  const style = {
    borderRadius: '12px',
    boxShadow: '0 0.2rem 0.6em rgba(0, 0, 0, 0.15)',
    overflow: 'clip',
    backgroundColor: data.note.color?.[0],
  };

  const wrapperStyle = {
    maxHeight: data.note.media?.url ? '302px' : '264px',
    overflow: 'hidden',
  };

  const extensions = [StarterKit];

  const editor = useEditor({
    extensions,
    content: data.note.content,
    editable: false,
  });

  useEffect(() => {
    editor?.commands.setContent(data.note.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div style={style} className="card-container">
      <Card className="note" isSelectable={false}>
        <Card.Body>
          {data.note.media?.url && data.note.isMediaVisible && (
            <NoteMedia media={data.note.media} />
          )}
          <div style={wrapperStyle}>
            <EditorContent editor={editor} />
          </div>
        </Card.Body>
        <Card.Footer>
          <Card.Text>{data.note.owner?.displayName}</Card.Text>
        </Card.Footer>
      </Card>
      {!isMobile && canMoveNote && hasRightsToUpdateNote(data.note) && (
        <NoteActions note={data.note}></NoteActions>
      )}
    </div>
  );
};
