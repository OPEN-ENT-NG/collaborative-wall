import { ReactNode, useEffect, useRef, useState } from "react";

import { TransformWrapper } from "react-zoom-pan-pinch";
import { useShallow } from "zustand/react/shallow";

import { ToolbarWrapper } from "../toolbar";
import { WhiteboardComponent } from "../whiteboard-component";
import { zoomConfig } from "~/config/init-config";
import { useWhiteboard } from "~/store";
import { calculateMinScale } from "~/utils/calculMinScale";

export const WhiteboardWrapper = ({ children }: { children: ReactNode }) => {
  const { setZoom, isMobile, canMoveBoard, setPositionViewport } =
    useWhiteboard(
      useShallow((state) => ({
        setZoom: state.setZoom,
        setPositionViewport: state.setPositionViewport,
        canMoveNote: state.canMoveNote,
        canMoveBoard: state.canMoveBoard,
        isMobile: state.isMobile,
      })),
    );

  const [minScale, setMinScale] = useState(1);

  const ref = useRef<any>(null);

  const handleScaleChange = (event: any) => {
    setPositionViewport({
      x: event.instance.transformState.positionX,
      y: event.instance.transformState.positionY,
    });
    setZoom(event.instance.transformState.scale);
  };

  useEffect(() => {
    const handleResize = () => {
      const newMinScale = calculateMinScale;
      setMinScale(newMinScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            />
            {!isMobile && (
              <ToolbarWrapper
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                setTransform={setTransform}
              />
            )}
          </div>
        )}
      </TransformWrapper>
    </>
  );
};
