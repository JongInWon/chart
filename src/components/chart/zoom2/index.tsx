/* eslint react/jsx-handler-names: "off" */
import React, { useState } from "react";
import { interpolateRainbow } from "d3-scale-chromatic";
import { Zoom } from "@visx/zoom";
import { localPoint } from "@visx/event";
import { RectClipPath } from "@visx/clip-path";
import genPhyllotaxis, {
  GenPhyllotaxisFunction,
  PhyllotaxisPoint,
} from "@visx/mock-data/lib/generators/genPhyllotaxis";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Axis, GlyphSeries, Grid, LineSeries, XYChart } from "@visx/xychart";
import { timeFormat } from "d3-time-format";
import { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { IDimensions } from "../line/line.types";

const bg = "#0a0a0a";
const points = [...new Array(1000)];

const colorScale = scaleLinear<number>({ range: [0, 1], domain: [0, 1000] });
const sizeScale = scaleLinear<number>({ domain: [0, 600], range: [0.5, 8] });

const initialTransform = {
  scaleX: 1.27,
  scaleY: 1.27,
  translateX: -211.62,
  translateY: 162.59,
  skewX: 0,
  skewY: 0,
};

export type ZoomIProps = {
  width: number;
  height: number;
};
let dimensions: IDimensions = {
  width: 800,
  height: 500,
  margins: 50,
};

dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;
const dataset = [
  { date: "2007-04-24T07:00:00.000Z", close: 93.24 },
  { date: "2007-04-25T07:00:00.000Z", close: 95.35 },
  { date: "2007-05-01T07:00:00.000Z", close: 99.47 },
  { date: "2007-05-02T07:00:00.000Z", close: 60.39 },
  { date: "2007-05-03T07:00:00.000Z", close: 70.4 },
  { date: "2007-05-04T07:00:00.000Z", close: 100.81 },
  { date: "2007-05-07T07:00:00.000Z", close: 120.92 },
];
const xAccessor = (d: AppleStock) => d.date;
const yAccessor = (d: AppleStock) => d.close;

const xScale = scaleBand({
  domain: dataset.map((d) => d),
  range: [dimensions.margins, dimensions.ctrWidth],
});

const yScale = scaleLinear({
  domain: [
    Math.min(...dataset.map(yAccessor)) - 1,
    Math.max(...dataset.map(yAccessor)) + 1,
  ],
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

/* Function to calc new domain for the X axis based on zoom level */
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

export default function ZoomI({ width, height }: ZoomIProps) {
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

  const generator: GenPhyllotaxisFunction = genPhyllotaxis({
    radius: 10,
    width,
    height,
  });
  const phyllotaxis: PhyllotaxisPoint[] = points.map((d, i) => generator(i));

  return (
    <>
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 2}
        scaleXMax={4}
        scaleYMin={1 / 2}
        scaleYMax={4}
        initialTransformMatrix={initialTransform}
      >
        {(zoom) => (
          <div className="relative">
            <svg
              width={width}
              height={height}
              style={{
                cursor: zoom.isDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
              ref={zoom.containerRef}
            >
              <RectClipPath id="zoom-clip" width={width} height={height} />
              <XYChart
                height={600}
                width={1000}
                xScale={{ type: "band" }}
                yScale={{ type: "linear" }}
              >
                <g transform={zoom.toString()}>
                  <Grid
                    lineStyle={{ strokeDasharray: "2,2", stroke: "#ECECEC" }}
                  />

                  <LineSeries
                    dataKey="line"
                    data={dataset}
                    xAccessor={xAccessor}
                    yAccessor={yAccessor}
                  />

                  <GlyphSeries
                    data={dataset}
                    dataKey="dot"
                    xAccessor={xAccessor}
                    yAccessor={yAccessor}
                  />
                </g>

                <Axis
                  orientation="bottom"
                  tickFormat={(date) => timeFormat("%m/%d")(new Date(date))}
                  tickValues={[...dataset.map(xAccessor)]}
                  strokeWidth={1}
                />

                <Axis orientation="left" strokeWidth={1} />
              </XYChart>
              <rect
                width={width}
                height={height}
                rx={14}
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
                onDoubleClick={(event) => {
                  const point = localPoint(event) || { x: 0, y: 0 };
                  zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                }}
              />
            </svg>
          </div>
        )}
      </Zoom>

      <style jsx>{`
        .btn {
          margin: 0;
          text-align: center;
          border: none;
          background: #2f2f2f;
          color: #888;
          padding: 0 4px;
          border-top: 1px solid #0a0a0a;
        }
        .btn-lg {
          font-size: 12px;
          line-height: 1;
          padding: 4px;
        }
        .btn-zoom {
          width: 26px;
          font-size: 22px;
        }
        .btn-bottom {
          margin-bottom: 1rem;
        }
        .description {
          font-size: 12px;
          margin-right: 0.25rem;
        }
        .controls {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .mini-map {
          position: absolute;
          bottom: 25px;
          right: 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .relative {
          position: relative;
        }
      `}</style>
    </>
  );
}
