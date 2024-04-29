import { ReactNode } from "react";

export const CollaborativeWallContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <div className="collaborativewall-container vh-100">{children}</div>;
};
