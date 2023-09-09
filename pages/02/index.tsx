import ZoomableLineChart from "../../src/components/chart/youtubeZoom";
import { useState } from "react";
import ZoomableLine from "../../src/components/chart/youtubeZoom";

const Page02 = () => {
  const [data, setData] = useState(
    Array.from({ length: 50 }, () => Math.round(Math.random() * 100)),
  );
  return (
    <>
      <h2>Zoomable Line Chart with D3 </h2>
      <ZoomableLine data={data} />
      <button
        onClick={() => setData([...data, Math.round(Math.random() * 100)])}
      >
        Add data
      </button>
    </>
  );
};

export default Page02;
