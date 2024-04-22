import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useViewport } from "reactflow";
import { backgroundColors, backgroundImages } from "~/config";
import { wallQueryOptions } from "~/services/queries";

export const CustomBackground = () => {
  const { x, y } = useViewport();
  const params = useParams();

  const { data } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

  const hasBackgroundImage = !!data?.background.path;

  const renderBackgroundImage = `url(${import.meta.env.PROD ? "/collaborativewall/public/${data?.background.path" ?? backgroundImages[0] : `/${data?.background.path ?? backgroundImages[0]}`}`;
  const renderBackgroundColor = `linear-gradient(${data?.background.color || backgroundColors[0]})`;

  return (
    <div
      style={{
        touchAction: "none",
        width: 2880,
        height: 1800,
        position: "absolute",
        transform: `translate(${x}px, ${y}px)`,
        background: hasBackgroundImage
          ? renderBackgroundImage
          : renderBackgroundColor,
      }}
    ></div>
  );
};
