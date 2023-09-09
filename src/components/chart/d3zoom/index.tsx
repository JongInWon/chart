import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { LineChart, Price, Tooltip } from "./styles";
import appleStock, { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { IDimension } from "./types";

const D3Zoom = ({ data, id = "myZoomableLineChart", width, height }) => {
  const ref = useRef(null);
  const [currentZoomState, setCurrentZoomState] = useState();

  useEffect(() => {
    const parseDate = d3.timeParse("%Y-%m-%d");
    const xAccessor = (d: any) => parseDate(d?.date);
    const yAccessor = (d: any) => parseInt(d?.close);

    // Dimensions
    let dimensions: IDimension = {
      width: width,
      height: height,
      margins: 50,
    };

    dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
    dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;

    // Draw Image
    const svg = d3
      .select(ref.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", `0 0 1000 500`);

    const svgContent = svg.select(".content");

    const ctr = svg
      .select(".container") // <g>
      .attr(
        "transform",
        `translate(${dimensions.margins}, ${dimensions.margins})`,
      );

    // Scales
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, yAccessor) as [number, number])
      .range([dimensions.ctrHeight, 0])
      .nice();

    const xScale = d3
      .scaleUtc()
      .domain(d3.extent(data, xAccessor) as [Date, Date])
      .range([0, dimensions.ctrWidth]);

    if (currentZoomState) {
      const newXScale = currentZoomState.rescaleX(xScale);
      xScale.domain(newXScale.domain());
    }

    const lineGenerator = d3
      .line()
      .y((d) => yScale(yAccessor(d)))
      .x((d) => xScale(xAccessor(d)!)); // 라인의 각 지점의 x 좌표를 계산

    // lineGenerator에 의해 생성된 값이 path 요소와고만 호환된다.
    svgContent
      .append("path")
      .datum(data)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#176B87")
      .attr("stroke-width", 2)
      .attr("clipPath", `url(#${id})`);

    svgContent
      .selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("stroke", "#053B50")
      .attr("r", 4)
      .attr("fill", "#64CCC5")
      .attr("cx", (d) => xScale(xAccessor(d)))
      .attr("cy", (d) => yScale(yAccessor(d)));

    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `$${d}`);
    const xAxis = d3.axisBottom(xScale);

    ctr.select("y-axis").call(yAxis);
    ctr
      .select(".x-axis")
      .call(xAxis)
      .style("transform", `translateY(${dimensions.ctrHeight}px)`);

    // zoom
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.5, 4])
      .translateExtent([
        [dimensions.margins, dimensions.margins],
        [dimensions.ctrWidth, dimensions.ctrHeight],
      ])
      .on("zoom", (event) => {
        const zoomState = event.transform;
        setCurrentZoomState(zoomState);
        console.log(zoomState);
      });

    svg.call(zoomBehavior);

    d3.select(ref.current)?.select("svg").remove();
  }, [currentZoomState]);

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <LineChart ref={ref}>
          <g className="container">
            <g className="content" clipPath={`url(#${id})`}></g>
            <g className="x-axis" />
            <g className="y-axis" />
          </g>
        </LineChart>
      </div>
    </>
  );
};

export default D3Zoom;
