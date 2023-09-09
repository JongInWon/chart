import appleStock, { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { IDimensions } from "../line/line.types";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Axis, GlyphSeries, Grid, LineSeries, XYChart } from "@visx/xychart";
import { timeFormat } from "d3-time-format";
import { Zoom } from "@visx/zoom";

const dataset = [
  { date: "2007-04-24T07:00:00.000Z", close: 93.24 },
  { date: "2007-04-25T07:00:00.000Z", close: 95.35 },
  { date: "2007-05-01T07:00:00.000Z", close: 99.47 },
  { date: "2007-05-02T07:00:00.000Z", close: 60.39 },
  { date: "2007-05-03T07:00:00.000Z", close: 70.4 },
  { date: "2007-05-04T07:00:00.000Z", close: 100.81 },
  { date: "2007-05-07T07:00:00.000Z", close: 120.92 },
];

let dimensions: IDimensions = {
  width: 800,
  height: 500,
  margins: 50,
};

dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;

const initialTransform = {
  scaleX: 1.27,
  scaleY: 1.27,
  translateX: -211.62,
  translateY: 162.59,
  skewX: 0,
  skewY: 0,
};

const XYChartUI = () => {
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

  return (
    <>
      <Zoom<SVGSVGElement>
        width={dimensions.ctrWidth}
        height={dimensions.ctrHeight}
        scaleXMin={1 / 2}
        scaleXMax={4}
        scaleYMin={1 / 2}
        scaleYMax={4}
        initialTransformMatrix={initialTransform}
      >
        {(zoom) => (
          <>
            <XYChart
              height={600}
              width={1000}
              xScale={{ type: "band" }}
              yScale={{ type: "linear" }}
              ref={zoom.containerRef}
              transform={zoom.toString()}
              style={{
                cursor: zoom.isDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            >
              <Grid lineStyle={{ strokeDasharray: "2,2", stroke: "#ECECEC" }} />

              <Axis
                orientation="bottom"
                tickFormat={(date) => timeFormat("%m/%d")(new Date(date))}
                tickValues={[...dataset.map(xAccessor)]}
                strokeWidth={1}
              />

              <Axis orientation="left" strokeWidth={1} />

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
            </XYChart>
          </>
        )}
      </Zoom>
    </>
  );
};

export default XYChartUI;
