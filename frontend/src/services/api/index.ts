import { odeServices } from "edifice-ts-client";

import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";

/**
 * getWall API
 * @param idWall wall id
 * @returns walls
 */
export const getWall = async (id: string): Promise<CollaborativeWallProps> => {
  const wall = await odeServices.http().get<CollaborativeWallProps>(`/collaborativewall/${id}`);

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
