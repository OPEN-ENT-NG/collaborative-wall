import { NoteMedia } from "./noteMedia";

export interface NoteProps {
  _id: string;
  title?: string;
  content: string;
  x: number;
  y: number;
  idwall: string;
  color: string[];
  media: NoteMedia | null;
  created?: { $date: number };
  modified?: { $date: number };
  owner?: {
    userId: string;
    displayName: string;
  };
  zIndex?: number;
}

export type PickedNoteProps = Pick<
  NoteProps,
  "content" | "x" | "y" | "idwall" | "color" | "modified" | "media"
>;
