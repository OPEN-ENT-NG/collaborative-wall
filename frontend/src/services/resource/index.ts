import {
  App,
  CollaborativewallUpdate,
  CreateParameters,
  CreateResult,
  IResource,
  ResourceService,
  ResourceType,
  UpdateResult,
} from 'edifice-ts-client';

const APP = 'collaborativewall';
const RESOURCE = 'collaborativewall';

const backgroundImages = [
  'img/blue-topo.png',
  'img/green-hill.png',
  'img/orange-hill.png',
];

const randomNumber = Math.trunc(
  Math.random() * (backgroundImages.length - 0) + 0,
);

export class CollaborativeWallResourceService extends ResourceService {
  getEditUrl(): string {
    throw new Error('Method not implemented.');
  }
  async create(parameters: CreateParameters): Promise<CreateResult> {
    const thumbnail = await this.getThumbnailPath(parameters.thumbnail);
    const res = await this.http.post<{ _id: string }>(`/collaborativewall`, {
      name: parameters.name,
      description: parameters.description,
      folder: parameters.folder,
      background: {
        path: backgroundImages[randomNumber],
        color: '115deg, #E5F5FF 0.32%, #46AFE6 100%',
      },
      icon: thumbnail,
    });

    this.checkHttpResponse(res);
    return { entId: res._id, thumbnail };
  }

  async update(parameters: CollaborativewallUpdate): Promise<UpdateResult> {
    const thumbnail = await this.getThumbnailPath(parameters.thumbnail);
    const res = await this.http.put<IResource>(
      `/collaborativewall/${parameters.entId}`,
      {
        _id: parameters.entId,
        name: parameters.name,
        description: parameters.description,
        icon: thumbnail,
      },
    );
    this.checkHttpResponse(res);
    return { thumbnail, entId: parameters.entId } as UpdateResult;
  }
  getResourceType(): ResourceType {
    return RESOURCE;
  }
  getApplication(): App | string {
    return APP;
  }
  getFormUrl(folderId?: string): string {
    return folderId
      ? `/collaborativewall?folderid=${folderId}/new`
      : `/collaborativewall/new`;
  }
  getViewUrl(resourceId: string): string {
    return `/collaborativewall/id/${resourceId}`;
  }
  getPrintUrl(resourceId: string): string {
    return `/collaborativewall/print/id/${resourceId}`;
  }
}
ResourceService.register(
  { application: APP, resourceType: RESOURCE },
  (context) => new CollaborativeWallResourceService(context),
);
