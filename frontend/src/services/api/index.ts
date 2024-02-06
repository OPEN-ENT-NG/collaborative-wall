import {
  GetContextParameters,
  ID,
  ShareRight,
  UpdateParameters,
  odeServices,
} from "edifice-ts-client";

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
  owner?: {
    userId: string;
    displayName: string;
  };
  zIndex?: number;
}

export const getNotes = async (id: string) => {
  const notes = odeServices
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
