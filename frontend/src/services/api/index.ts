import { odeServices } from "edifice-ts-client";

export interface CollaborativeWallType {
  _id: string;
  name: string;
  description: string;
  background: string;
  created: { $date: number };
  modified: { $date: number };
  owner: {
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
  owner?: {
    userId: string;
    displayName: string;
  };
  zIndex?: number;
}

/**
 * getNote API
 * @param idWall wall id
 * @param idNote note id
 * @returns note
 */
export const getNote = async (
  idWall: string,
  idNote: string,
): Promise<NoteProps> => {
  return await odeServices
    .http()
    .get<NoteProps>(`/collaborativewall/${idWall}/note/${idNote}`);
};

/**
 * getNotes API
 * @param id, resource ID
 * @returns notes
 */
export const getNotes = async (id: string) => {
  const notes = await odeServices
    .http()
    .get<NoteProps[]>(`/collaborativewall/${id}/notes`);
  return notes;
};
