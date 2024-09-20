export {default} from "./chart.js";


/* 
import * as d3 from "d3";
import { useEffect, useRef, useState } from "preact/hooks";
import { h, VNode } from "preact";

// Import the required chart and legend functions
import { chart as newChart, colors as colorScale } from "./chart.js"; // Adjust path if necessary
import { Legend } from "./colorlegends.js";  // Import the legend utility

interface Props {}

export function Normalized({}: Props): VNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);  // Ref for the legend container
  const [riaa, setRiaa] = useState<d3.DSVParsedArray<object>>();

  useEffect(() => {
    // Load the dataset
    d3.csv("assets/data/riaa-us-revenue.csv", d3.autoType).then((d) => {
      setRiaa(d);
    });
  }, []);

  useEffect(() => {
    if (!riaa || !containerRef.current || !legendRef.current) return;

    // Create the chart using the newChart function
    const chart = newChart(d3, riaa);

    // Append the chart to the container
    containerRef.current.appendChild(chart);

    // Create the color legend using the Legend function from a33468b95d0b15b0@817.js
    const legend = Legend(colorScale(), { title: "Revenue by Format" });
    legendRef.current.appendChild(legend);

    // Cleanup when component unmounts
    return () => {
      if (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      if (legendRef.current.firstChild) {
        legendRef.current.removeChild(legendRef.current.firstChild);
      }
    };
  }, [riaa]);

  return (
    <div>
      <div ref={containerRef} />  {/* Container for the chart */
/*       <div ref={legendRef} />  {/* Container for the legend }
    </div>
  );
} */
