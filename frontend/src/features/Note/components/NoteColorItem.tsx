import clsx from "clsx";

import styles from "./NoteColorItem.module.css";

export const NoteColorItem = ({
  borderColor,
  className,
}: {
  borderColor: string;
  className?: string;
}) => {
  return (
    <div
      className={clsx(className, styles.item)}
      style={{
        borderColor: borderColor,
      }}
    />
  );
};
