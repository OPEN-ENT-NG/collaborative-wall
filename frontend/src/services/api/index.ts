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

export const getCollaborativeWall = async (id: string) => {
  const response = await fetch(`/collaborativewall/${id}`);
  const collaborativeWall: CollaborativeWallType = await response.json();
  return collaborativeWall;
};
