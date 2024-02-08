import { ReactNode, useRef } from "react";

import { TransformWrapper } from "react-zoom-pan-pinch";

import { ToolbarWrapper } from "../toolbar";
import { WhiteboardComponent } from "../whiteboard-component";
import { zoomConfig } from "~/config/init-config";
import { CollaborativeWallProps } from "~/routes/collaborative-wall";
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

  return (
    <>
      <TransformWrapper
        ref={ref}
        disabled={!canMoveBoard}
        initialScale={zoomConfig.DEFAULT_ZOOM}
        minScale={zoomConfig.MIN_ZOOM}
        maxScale={zoomConfig.MAX_ZOOM}
        onTransformed={(e) => handleScaleChange(e)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
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
            />
            <ToolbarWrapper
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              resetTransform={resetTransform}
            />
          </div>
        )}
      </TransformWrapper>
    </>
  );
};
