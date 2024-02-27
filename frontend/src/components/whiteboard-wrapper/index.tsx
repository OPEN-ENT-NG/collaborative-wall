import { ReactNode, useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { TransformWrapper } from "react-zoom-pan-pinch";
import { useShallow } from "zustand/react/shallow";

import { ToolbarWrapper } from "../toolbar";
import { WhiteboardComponent } from "../whiteboard-component";
import { zoomConfig } from "~/config/init-config";
import { useHasRights } from "~/hooks/useHasRights";
import { wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";
import { calculateMinScale } from "~/utils/calculMinScale";

export const WhiteboardWrapper = ({ children }: { children: ReactNode }) => {
  const { setZoom, isMobile, canMoveBoard } = useWhiteboard(
    useShallow((state) => ({
      setZoom: state.setZoom,
      canMoveBoard: state.canMoveBoard,
      isMobile: state.isMobile,
    })),
  );

  const [minScale, setMinScale] = useState(1);

  const params = useParams();

  const ref = useRef<any>(null);

  const handleScaleChange = (event: any) => {
    setZoom(event.instance.transformState.scale);
  };

  const { data: wall } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

  const canUpdate = useHasRights({
    roles: ["creator"],
    rights: wall?.rights,
  });

  useEffect(() => {
    const handleResize = () => {
      const newMinScale = calculateMinScale;
      setMinScale(newMinScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [window.innerHeight, window.innerWidth]);

  return (
    <>
      <TransformWrapper
        ref={ref}
        initialScale={zoomConfig.DEFAULT_ZOOM}
        minScale={minScale}
        maxScale={zoomConfig.MAX_ZOOM}
        onTransformed={(e) => handleScaleChange(e)}
        wheel={{ wheelDisabled: canMoveBoard }}
        panning={{ wheelPanning: canMoveBoard, disabled: !canMoveBoard }}
      >
        {({ zoomIn, zoomOut, setTransform }) => (
          <div>
            <WhiteboardComponent
              children={children}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              canUpdate={canUpdate}
            />
            {!isMobile && (
              <ToolbarWrapper
                wallId={wall?._id}
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                setTransform={setTransform}
                canUpdate={canUpdate}
              />
            )}
          </div>
        )}
      </TransformWrapper>
    </>
  );
};
