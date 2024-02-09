import { odeServices } from "edifice-ts-client";

import { Note } from "~/models/notes";
import { Wall } from "~/models/wall";

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

/**
 * getWall API
 * @param idWall wall id
 * @returns walls
 */
export const getWall = async (id: string): Promise<Wall> => {
  const wall = await odeServices.http().get<Wall>(`/collaborativewall/${id}`);

  console.log({ wall });

  return wall;
};

/**
 * getNote API
 * @param idWall wall id
 * @param idNote note id
 * @returns note
 */
export const getNote = async (
  idWall: string,
  idNote: string,
): Promise<Note> => {
  return await odeServices
    .http()
    .get<Note>(`/collaborativewall/${idWall}/note/${idNote}`);
};

/**
 * getNotes API
 * @param id, resource ID
 * @returns notes
 */
export const getNotes = async (id: string) => {
  const notes = await odeServices
    .http()
    .get<Note[]>(`/collaborativewall/${id}/notes`);
  return notes;
};
