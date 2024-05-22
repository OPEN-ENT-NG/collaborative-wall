import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useViewport } from "reactflow";
import { useShallow } from "zustand/react/shallow";
import { backgroundColors, backgroundImages } from "~/config";
import { wallQueryOptions } from "~/services/queries";
import { useWhiteboardStore } from "~/store";

export const CustomBackground = () => {
  const { x, y } = useViewport();
  const params = useParams();

  const { setPositionViewport } = useWhiteboardStore(
    useShallow((state) => ({
      setPositionViewport: state.setPositionViewport,
    })),
  );

  const { data } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

  const hasBackgroundImage = !!data?.background.path;
  const path = hasBackgroundImage ? data?.background.path : backgroundImages[0];

  const renderBackgroundImage = `url(${import.meta.env.PROD ? `/collaborativewall/public/${path}` : `/${path}`}`;
  const renderBackgroundColor = `linear-gradient(${data?.background.color || backgroundColors[0]})`;

  useEffect(() => {
    setPositionViewport({ x, y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

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
