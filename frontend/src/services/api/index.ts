import { odeServices } from "edifice-ts-client";

import { NoteProps, PickedNoteProps } from "~/models/notes";
import {
  CollaborativeWallProps,
  PickedCollaborativeWallProps,
} from "~/models/wall";

const checkHttpResponse = () => {
  const { status } = odeServices.http().latestResponse;
  if (status == 401) {
    throw "unauthorized";
  } else if (status == 404) {
    throw "notfound";
  } else if (status >= 400) {
    throw "error";
  }
};
/**
 * loadWall API
 * @param wallId wall id
 * @returns walls
 */
export const loadWall = async (
  wallId: string,
): Promise<CollaborativeWallProps> => {
  const wall = await odeServices
    .http()
    .get<CollaborativeWallProps>(`/collaborativewall/${wallId}`);
  checkHttpResponse();
  return wall;
};

/**
 * updateWall API
 * @param wallId, string
 * @returns status and updated wall
 */
export const updateWall = async (
  wallId: string,
  wall: PickedCollaborativeWallProps,
) => {
  const res = await odeServices
    .http()
    .put(`/collaborativewall/${wallId}`, wall);
  checkHttpResponse();
  return res;
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
  const res = await odeServices
    .http()
    .get<NoteProps>(`/collaborativewall/${wallId}/note/${noteId}`);
  checkHttpResponse();
  return res;
};
/**
 * getNotes API
 * @param wallId, wallId
 * @returns notes
 */
export const getNotes = async (wallId: string) => {
  const notes = await odeServices
    .http()
    .get<NoteProps[]>(`/collaborativewall/${wallId}/notes`);
  checkHttpResponse();
  return notes;
};

/**
 * updateNote API
 * @param wallId, string
 * @param noteId, string
 * @returns status and updated notes
 */
export const updateNote = async (
  wallId: string,
  noteId: string,
  note: PickedNoteProps,
) => {
  const res = await odeServices
    .http()
    .put(`/collaborativewall/${wallId}/note/${noteId}`, note);
  checkHttpResponse();
  return res;
};

export const sessionHasWorkflowRights = async (actionRights: string[]) => {
  return await odeServices.rights().sessionHasWorkflowRights(actionRights);
};
