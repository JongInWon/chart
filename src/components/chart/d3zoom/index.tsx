import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { LineChart, Price, Tooltip, Wrapper } from "./styles";
import appleStock, { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { IDimension } from "./types";

const D3Zoom = ({ data, id = "myZoomableLineChart", width, height }) => {
  const ref = useRef();
  const tooltipRef = useRef(null);
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
      let newXScale = currentZoomState.rescaleX(xScale);

      let [start, end] = newXScale.domain();
      let startIndex = d3.bisectLeft(data.map(xAccessor), start);
      let endIndex = d3.bisectLeft(data.map(xAccessor), end);
      startIndex = Math.max(0, startIndex);
      endIndex = Math.min(data.length - 1, endIndex);
      let slicedData = data.slice(startIndex, endIndex + 1);
      let [yMin, yMax] = d3.extent(slicedData, yAccessor);
      xScale.domain(newXScale.domain());
      yScale.domain([yMin, yMax]);
    }

    const lineGenerator = d3
      .line()
      .y((d) => yScale(yAccessor(d)))
      .x((d) => xScale(xAccessor(d))); // 라인의 각 지점의 x 좌표를 계산

    // lineGenerator에 의해 생성된 값이 path 요소와고만 호환된다.
    svgContent
      .selectAll(".line")
      .data([data])
      .join("path")
      .attr("class", "line")
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

    ctr.select(".y-axis").call(yAxis);
    ctr
      .select(".x-axis")
      .call(xAxis)
      .style("transform", `translateY(${dimensions.ctrHeight}px)`);

    const tooltip = d3.select(tooltipRef.current);

    const tooltipDot = ctr
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#fc8681")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .style("pointer-event", "none");

    // tooltip
    ctr
      .append("rect")
      .attr("width", dimensions.ctrWidth)
      .attr("height", dimensions.ctrHeight)
      .style("opacity", 0)
      .on("mousemove touchmouse", function (event) {
        const mousePos = d3.pointer(event, this); // 현재 마우스의 좌표 반환
        const date = xScale.invert(mousePos[0]); // mousePos[0]에 x 좌표가 들어있다.
        const bisector = d3.bisector(xAccessor).left;
        const index = bisector(data, date); // dataset에서 date와 일치하는 인덱스
        // 배열에 요소를 삽입 하려는 것이 아니다.인덱스를 얻으려는 거다
        const stock = data[index - 1];

        // Update Image
        tooltipDot
          .style("opacity", 1)
          .attr("cy", yScale(yAccessor(stock)))
          .attr("cx", xScale(xAccessor(stock))) // 두 번째 인자 함수는 데이터와 결합하지 않기 때문에 화살표 함수 안
          .raise(); // 이미지 앞으로 도형을 올린다.

        tooltip
          .style("display", "block")
          .style("top", yScale(yAccessor(stock)) - 20 + "px")
          .style("left", xScale(xAccessor(stock)) - 90 + "px");

        const dateFormat = d3.timeFormat("%B %-d, %Y");

        tooltip.select(".price").text(`$${yAccessor(stock)}`);
        tooltip.select(".date").text(`${dateFormat(xAccessor(stock))}`);
      })
      .on("mouseleave", function (event) {
        tooltipDot.style("opacity", 0);

        tooltip.style("display", "none");
      });

    // zoom
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([1, 5])
      .translateExtent([
        [-100, dimensions.margins],
        [dimensions.ctrWidth + 100, dimensions.ctrHeight],
      ])
      .on("zoom", (event) => {
        const zoomState = event.transform;
        setCurrentZoomState(zoomState);
      });

    svg.call(zoomBehavior);
  }, [currentZoomState]);

  return (
    <>
      <Wrapper>
        <LineChart ref={ref}>
          <g className="container">
            <defs>
              <clipPath id={id}>
                <rect x="0" y="-5" width="900" height="405" />
              </clipPath>
            </defs>
            <g className="content" clipPath={`url(#${id})`} />
            <g className="x-axis" />
            <g className="y-axis" />
          </g>
        </LineChart>
        <Tooltip ref={tooltipRef} id="tooltip">
          <Price className="price"></Price>
          <div className="date"></div>
        </Tooltip>
      </Wrapper>
    </>
  );
};

export default D3Zoom;
