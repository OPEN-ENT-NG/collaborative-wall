export const Square = ({
  borderColor,
  className,
}: {
  borderColor: string;
  className?: string;
}) => {
  return (
    <div
      className={className}
      style={{
        width: "22px",
        height: "22px",
        border: "1px solid",
        borderRadius: "22px",
        borderColor: borderColor,
      }}
    />
  );
};
