import { ReactNode, useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { TransformWrapper } from "react-zoom-pan-pinch";
import { useShallow } from "zustand/react/shallow";

import { ToolbarWrapper } from "../toolbar";
import { WhiteboardComponent } from "../whiteboard-component";
import { zoomConfig } from "~/config/init-config";
import { useUserRights } from "~/hooks/useUserRights";
import { wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";

export const WhiteboardWrapper = ({ children }: { children: ReactNode }) => {
  const { setZoom, isMobile, canMoveBoard } = useWhiteboard(
    useShallow((state) => ({
      setZoom: state.setZoom,
      canMoveBoard: state.canMoveBoard,
      isMobile: state.isMobile,
    })),
  );

  const params = useParams();

  const ref = useRef<any>(null);

  const handleScaleChange = (event: any) => {
    setZoom(event.instance.transformState.scale);
  };

  const { data } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

  const { canUpdate } = useUserRights({ data });

  return (
    <>
      <TransformWrapper
        ref={ref}
        initialScale={zoomConfig.DEFAULT_ZOOM}
        minScale={zoomConfig.MIN_ZOOM}
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
                wallId={data?._id}
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
