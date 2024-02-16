import { odeServices } from "edifice-ts-client";

import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";

/**
 * getWall API
 * @param wallId wall id
 * @returns walls
 */
export const getWall = async (
  wallId: string,
): Promise<CollaborativeWallProps> => {
  const wall = await odeServices
    .http()
    .get<CollaborativeWallProps>(`/collaborativewall/${wallId}`);

  return wall;
};

/**
 * getNote API
 * @param wallId wall id
 * @param noteId note id
 * @returns note
 */
export const getNote = async (
  wallId: string,
  noteId: string,
): Promise<NoteProps> => {
  return await odeServices
    .http()
    .get<NoteProps>(`/collaborativewall/${wallId}/note/${noteId}`);
};

/**
 * getNotes API
 * @param wallId, resource ID
 * @returns notes
 */
export const getNotes = async (wallId: string) => {
  const notes = await odeServices
    .http()
    .get<NoteProps[]>(`/collaborativewall/${wallId}/notes`);
  return notes;
};

/**
 * updateNotes API
 * @param id note id
 * @returns note
 */
export const updateNote = async (
  id: string,
  note: {
    content: string;
    x: number;
    y: number;
    idwall: string;
    color: string[];
    modified?: { $date: number };
  },
) => {
  return await odeServices
    .http()
    .put(`/collaborativewall/${note.idwall}/note/${id}`, note);
};

export const sessionHasWorkflowRights = async (actionRights: string[]) => {
  return await odeServices.rights().sessionHasWorkflowRights(actionRights);
};
