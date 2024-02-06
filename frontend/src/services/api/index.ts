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
