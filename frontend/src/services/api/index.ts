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

export const sessionHasWorkflowRights = async (actionRights: string[]) => {
  return await odeServices.rights().sessionHasWorkflowRights(actionRights);
};

export const searchContext = async (searchParams: GetContextParameters) => {
  const search = await odeServices
    .resource(searchParams.application)
    .searchContext(searchParams);

  console.log({ search });

  return search;
};

/**
 * shareResource API
 * @param searchParams, entId, shares
 * @returns shared resource
 */
export const shareResource = async (
  application: string,
  {
    resourceId,
    rights,
  }: {
    resourceId: ID;
    rights: ShareRight[];
  },
) => {
  return await odeServices.share().saveRights(application, resourceId, rights);
};

/**
 * updateResource API
 * @param searchParams, params
 * @returns updated resource
 */
export const updateResource = async (
  application: string,
  {
    params,
  }: {
    params: UpdateParameters;
  },
) => {
  console.log(application, { params });
  return await odeServices.resource(application).update(params);
};
