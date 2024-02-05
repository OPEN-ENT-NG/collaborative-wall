import { ShareRight } from "edifice-ts-client";

export const showShareRightLine = (
  shareRight: ShareRight,
  showBookmarkMembers: boolean,
): boolean =>
  (shareRight.isBookmarkMember && showBookmarkMembers) ||
  !shareRight.isBookmarkMember;
