import { ReactNode, useRef } from "react";

import { TransformWrapper } from "react-zoom-pan-pinch";

import { ToolbarWrapper } from "../toolbar";
import { WhiteboardComponent } from "../whiteboard-component";
import { zoomConfig } from "~/config/init-config";
import { useUserRights } from "~/hooks/useUserRights";
import { CollaborativeWallProps } from "~/models/wall";
import { useWhiteboard } from "~/store";

export const WhiteboardWrapper = ({
  children,
  data,
}: {
  children: ReactNode;
  data: CollaborativeWallProps;
}) => {
  const { canMoveBoard, setZoom } = useWhiteboard();

  const ref = useRef<any>(null);

  const handleScaleChange = (event: any) => {
    setZoom(event.instance.transformState.scale);
  };

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
          <div
            style={{
              background: "linear-gradient(#46AFE6, #E5F5FF)",
            }}
          >
            <WhiteboardComponent
              children={children}
              data={data}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              canUpdate={canUpdate}
            />
            <ToolbarWrapper
              wallId={data._id}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              setTransform={setTransform}
            />
          </div>
        )}
      </TransformWrapper>
    </>
  );
};
