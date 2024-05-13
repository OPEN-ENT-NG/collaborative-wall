import clsx from "clsx";

import styles from "./color-item.module.css";

export const Circle = ({
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
