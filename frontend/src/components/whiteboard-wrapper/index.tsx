import { ReactNode, useRef } from "react";

import { TransformWrapper } from "react-zoom-pan-pinch";

import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { Toolbar } from "../toolbar";
import { WhiteboardComponent } from "../whiteboard-component";
import { zoomConfig } from "~/config/init-config";
import { CollaborativeWallProps } from "~/routes/collaborative-wall";

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
          <>
            <WhiteboardComponent
              children={children}
              data={data}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
            />
            <Toolbar
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              resetTransform={resetTransform}
            />
          </>
        )}
      </TransformWrapper>
    </>
  );
};
