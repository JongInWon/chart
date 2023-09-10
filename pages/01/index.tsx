import { Background, Container } from "./styles";
import appleStock, { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { useState } from "react";
import D3Zoom from "../../src/components/chart/d3zoom";
import * as d3 from "d3";
import ZoomableLineChart from "../../src/components/chart/youtubeZoom";
const data = [
  { date: "2007-05-08", close: 80.06 },
  { date: "2010-03-09", close: 86.88 },
  { date: "2011-07-10", close: 107.34 },
  { date: "2015-08-11", close: 228.74 },
  { date: "2018-05-21", close: 148.74 },
  { date: "2019-07-11", close: 208.74 },
  { date: "2020-05-11", close: 228.74 },
  { date: "2022-06-11", close: 258.74 },
  { date: "2023-9-11", close: 298.74 },
];

const Test = () => {
  return (
    <>
      <D3Zoom data={data} width={1000} height={500} />
    </>
  );
};

export default Test;
