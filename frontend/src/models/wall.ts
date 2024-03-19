export interface CollaborativeWallProps {
  _id: string;
  name: string;
  background: {
    path: string;
    color: string;
  };
  created: { $date: number };
  modified: { $date: number };
  owner: {
    userId: string;
    displayName: string;
  };
  shared: string[];
  rights: string[];
  description?: string;
}

export type PickedCollaborativeWallProps = Pick<
  CollaborativeWallProps,
  "background" | "name" | "description"
>;
