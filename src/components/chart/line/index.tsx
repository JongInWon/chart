import appleStock, { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { IDimensions } from "./line.types";
import { Zoom, applyMatrixToPoint } from "@visx/zoom";
import { Group } from "@visx/group";
import { MarkerCircle } from "@visx/marker";
import { AxisLeft, AxisTop } from "@visx/axis";
import { scaleLinear } from "@visx/scale";
import { Grid } from "@visx/grid";

import { RectClipPath } from "@visx/clip-path";

let dimensions: IDimensions = {
  width: 800,
  height: 500,
  margins: 50,
};

dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;

const dataset = appleStock.slice(0, 100);

const LineChartUI = () => {
  const xAccessor = (d: AppleStock) => d.date;
  const yAccessor = (d: AppleStock) => d.close;

  const xScale = scaleLinear({
    domain: dataset.map(xAccessor),
    range: [dimensions.margins, dimensions.ctrWidth],
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...dataset.map(yAccessor)) + 1],
    range: [dimensions.ctrHeight, dimensions.margins],
  });

  const rescaleYAxis = (scale, zoom) => {
    const newDomain = scale
      .range()
      .map((r) =>
        scale.invert(
          (r - zoom.transformMatrix.translateY) / zoom.transformMatrix.scaleY,
        ),
      );
    return scale.copy().domain(newDomain);
  };

  const rescaleXAxis = (scale, zoom) => {
    const newDomain = scale
      .range()
      .map((r) =>
        scale.invert(
          (r - zoom.transformMatrix.translateX) / zoom.transformMatrix.scaleX,
        ),
      );
    return scale.copy().domain(newDomain);
  };

  return (
    <Zoom width={dimensions.width} height={dimensions.height}>
      {(zoom) => {
        const zoomedScaleX = rescaleXAxis(xScale, zoom);
        const zoomedScaleY = rescaleYAxis(yScale, zoom);

        const ZoomControls = () => (
          <rect
            width={dimensions.width}
            height={dimensions.height}
            fill="transparent"
            onTouchStart={zoom.dragStart}
            onTouchMove={zoom.dragMove}
            onTouchEnd={zoom.dragEnd}
            onMouseDown={zoom.dragStart}
            onMouseMove={zoom.dragMove}
            onMouseUp={zoom.dragEnd}
            onMouseLeave={() => {
              if (zoom.isDragging) zoom.dragEnd();
            }}
          />
        );

        return (
          <>
            <svg
              width={dimensions.width}
              height={dimensions.height}
              style={{
                cursor: zoom.isDragging ? "grabbing" : "grab",
              }}
            >
              <Group left={dimensions.margins} top={dimensions.margins}>
                <Grid
                  numTicksColumns={0}
                  xScale={zoomedScaleX}
                  yScale={zoomedScaleY}
                  width={dimensions.ctrWidth}
                  height={dimensions.ctrHeight}
                />
                <AxisLeft scale={zoomedScaleY} />
                <AxisTop scale={zoomedScaleX} />
                <RectClipPath
                  id="zoom-clip"
                  width={dimensions.width}
                  height={dimensions.height}
                />
                <MarkerCircle
                  id="marker-circle"
                  fill="#fff"
                  stroke="#0058A3"
                  size={5}
                />
                <ZoomControls />
              </Group>
              <Group
                clipPath="url(#zoom-clip)"
                transform={`
                    scale(0.25)
                    translate(${
                      dimensions.width * 4 - dimensions.width - 60
                    }, ${dimensions.height * 4 - dimensions.height - 60})
                  `}
              >
                <rect
                  width={dimensions.ctrWidth}
                  height={dimensions.height}
                  fill="white"
                  fillOpacity={0.2}
                  stroke="white"
                  strokeWidth={4}
                  transform={zoom.toStringInvert()}
                />
              </Group>
            </svg>
            <div className="controls">
              <button type="button" className="btn btn-lg" onClick={zoom.reset}>
                Reset
              </button>
            </div>
          </>
        );
      }}
    </Zoom>
  );
};

export default LineChartUI;
