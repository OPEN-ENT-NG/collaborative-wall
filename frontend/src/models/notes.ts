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
  owner?: {
    userId: string;
    displayName: string;
  };
  zIndex?: number;
}
