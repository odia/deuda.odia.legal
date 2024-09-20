import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {
  format,
  parse,
  setDay,
  setHours,
  setMinutes,
  setMonth,
  setSeconds,
  setYear,
} from "date-fns";
import { h, VNode } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { chart as newChart, colors as colorScale, series } from "./chart.js";
import { Legend } from "./colorlegends.js";
// import {createElement as h} from "preact";
interface Props {}

interface Data {
  operation: string;
  date: Date;
  value: number;
  interest: number;
  raw: any;
}
const before = new Date(2023, 11, 11, 0, 0, 0);
function defined(x: Data | undefined): x is Data {
  return (
    !!x &&
    x.operation !== " BID 4796 PROG APOY REF TRANS" &&
    x.date.getTime() < before.getTime()
  );
}

export function Histogram({}: Props): VNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [goog, setGoog] = useState<d3.DSVParsedArray<object>>();
  const [aapl, setAapl] = useState<d3.DSVParsedArray<object>>();
  const [ejem, setEjemplo] = useState<d3.DSVParsedArray<object>>();
  useEffect(() => {
    d3.csv("assets/data/goog.csv", d3.autoType).then((d) => {
      setGoog(d);
    });
    d3.csv("assets/data/aapl.csv", d3.autoType).then((d) => {
      setAapl(d);
    });
    d3.csv("assets/data/ejemplo.csv", d3.autoType).then((d) => {
      setEjemplo(d);
    });
  }, []);

  useEffect(() => {
    if (goog === undefined) return;
    if (aapl === undefined) return;
    if (ejem === undefined) return;
    if (containerRef.current === null) return;

    const plot = Plot.plot({
      style: "width: 100%;",
      grid: true,
      height: 300,
      x: { label: "Fecha " },
      y: { label: "Precio (ARS)" },
      marks: [
        Plot.lineY(goog, { x: "Date", y: "Close", stroke: "red" }),
        Plot.lineY(aapl, { x: "Date", y: "Close", stroke: "blue" }),
      ],
    });

    containerRef.current.append(plot);
    return () => plot.remove();
  }, [goog, aapl, ejem]);

  return <div ref={containerRef} />;
}

export function Normalized({}: Props): VNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null); // Ref for the legend container
  const [riaa, setRiaa] = useState<d3.DSVParsedArray<object>>();

  useEffect(() => {
    // Load the dataset
    d3.csv("assets/data/ejemplo.csv", d3.autoType).then((d) => {
      setRiaa(d);
    });
  }, []);

  useEffect(() => {
    if (!riaa || !containerRef.current || !legendRef.current) return;
    const colors = colorScale();
    const pepe = riaa.map(({ Format, Year, ["Revenue (Inflation Adjusted)"]: Revenue }:any) => ({
      name: Format,
      year: +Year,
      value: +Revenue
    }))
    const s = series(d3, colors, pepe);
    // Create the chart using the newChart function
    const chart = newChart(d3, riaa, s, colors);

    // Append the chart to the container
    containerRef.current.appendChild(chart);

    // Create the color legend using the Legend function from a33468b95d0b15b0@817.js
    const legend = Legend(d3, colorScale(), { title: "Revenue by Format" });
    if (legend) {
      legendRef.current.appendChild(legend);
    } else {
      console.log("por alguna razon no se creo el componente");
    }

    // Cleanup when component unmounts
    return () => {
      if (containerRef.current && containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      if (legendRef.current && legendRef.current.firstChild) {
        legendRef.current.removeChild(legendRef.current.firstChild);
      }
    };
  }, [riaa]);

  return (
    <div>
      <div ref={containerRef} /> {/* Container for the chart */}
      <div ref={legendRef} /> {/* Container for the legend */}
    </div>
  );
}

/* 
export function Normalized({}: Props): VNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [riaa, setRiaa] = useState<d3.DSVParsedArray<object>>();
  useEffect(() => {
    d3.csv("assets/data/riaa-us-revenue.csv", d3.autoType).then((d) => {
      setRiaa(d);
    });
  }, []);

  useEffect(() => {
    if (riaa === undefined) return;
    if (containerRef.current === null) return;

    // const plot = Plot.plot({
    //   style: "width: 100%;",
    //   grid: true,
    //   height: 300,
    //   x: { label: "Fecha " },
    //   y: { label: "Precio (ARS)", percent: true },
    //   marks: [
    //     Plot.areaY(
    //       riaa,
    //       Plot.stackY(
    //         { offset: "normalize", order: "group", reverse: true },
    //         { x: "year", y: "revenue", z: "format", fill: "group" }
    //       )
    //     ),
    //     Plot.ruleY([0, 1]),
    //   ],
    // });
    console.log(riaa)
    const plot = Plot.plot({
      y: {
        label: "↑ Annual revenue (%)",
        percent: true
      },
      marks: [
        Plot.areaY(riaa, Plot.stackY({offset: "normalize", order: "group", reverse: true}, {x: "year", y: "revenue", z: "format", fill: "group"})),
        Plot.ruleY([0, 1])
      ]
    })

    containerRef.current.append(plot);
    return () => plot.remove();
  }, [riaa]);

  return <div ref={containerRef} />;
}
 */
