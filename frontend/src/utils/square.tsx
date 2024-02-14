export const Square = ({ colors }: { colors: string[] }) => {
  return (
    <div
      style={{
        width: "22px",
        height: "22px",
        border: "1px solid",
        borderRadius: "22px",
        color: colors[1] ?? "",
        backgroundColor: colors[0] ?? "",
      }}
    />
  );
};
