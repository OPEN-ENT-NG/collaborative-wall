export interface CollaborativeWallType {
  _id: string;
  name: string;
  description: string;
  background: string;
  created: { $date: number };
  modified: { $date: number };
  author: {
    userId: string;
    displayName: string;
  };
}

export interface NoteProps {
  _id: string;
  title?: string;
  content: string;
  x: number;
  y: number;
  idwall?: string;
  color?: string[];
  created?: { $date: number };
  modified?: { $date: number };
  author?: {
    userId: string;
    displayName: string;
  };
  zIndex?: number;
}

export const getNotes = async (id: string) => {
  const response = await fetch(`/collaborativewall/${id}/notes`);
  const collaborativeWall: NoteProps[] = await response.json();
  return collaborativeWall;
};
