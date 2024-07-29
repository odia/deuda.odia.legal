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
  // const [data, setData] = useState<Data[]>();
  const [goog, setGoog] = useState<d3.DSVParsedArray<object>>();
  const [aapl, setAapl] = useState<d3.DSVParsedArray<object>>();
  useEffect(() => {
    // fetch("https://www.sebasjm.ar/assets/2023_data.json").then(d => {
    //   return d.text()
    // }).then(s => {
    //   const asd = s.split("\n")
    //   const list = asd.map((line, idx) => {
    //     if (!line) return;
    //     const parsed = JSON.parse(line);
    //     if (idx < 10) {
    //       console.log(parsed)
    //     }
    //     const operation = parsed["Nombre de la Operacion"] as string
    //     // const when = new Date(parsed["Ano"], parsed["Mes"], parsed["Dia"])
    //     // setDay(when, parsed["Dia"])
    //     // setMonth(when, parsed["Mes"])
    //     // setYear(when, parsed["Ano"])
    //     // setSeconds(when, 0)
    //     // setMinutes(when, 0)
    //     // setHours(when, 0)
    //     const when = parse(parsed["Fecha de Servicio"], "MM/dd/yy HH:mm:ss", new Date())

    //     const value = parsed["Principal en Dolares"] as number
    //     // if (!value) {
    //     //   return undefined;
    //     // }
    //     const interest = parsed["Interes en Dolares"] as number
    //     // console.log(parsed)
    //     return { operation, date: when, value, interest, raw: parsed }
    //   }).filter(defined)
    //   list.sort((a, b) => {
    //     const cmp = a.operation.localeCompare(b.operation)
    //     if (cmp) {
    //       return cmp;
    //     }
    //     return a.date.getTime() - b.date.getTime()
    //   })
    //   const smaller = list.slice(0, 100)

    //   setData(smaller)
    //   return null
    // })
    //
    //
    d3.csv("assets/data/goog.csv", d3.autoType).then((d) => {
      setGoog(d);
    });
    d3.csv("assets/data/aapl.csv", d3.autoType).then((d) => {
      setAapl(d);
    });
  }, []);

  useEffect(() => {
    if (goog === undefined) return;
    if (aapl === undefined) return;
    if (containerRef.current === null) return;

    // const plot = Plot.plot({
    //   // grid: true,
    //   // inset: 10,
    //   // aspectRatio: 1,
    //   x: { domain: [new Date("2024-03-01"), new Date("2024-5-01")] },
    //   marginLeft: 100,
    //   color: { legend: true },
    //   marks: [
    //     Plot.ruleY([0]),
    //     // Plot.lineY(smaller, { x: "when", y: "value" }),
    //     Plot.lineY(data, { x: "date", y: "value", stroke: "operation" }),
    //   ]
    // });
    const plot = Plot.plot({
      style: "width: 100%;",
      grid: true,
      height: 300,
      marks: [
        Plot.lineY(goog, { x: "Date", y: "Close", stroke: "red" }),
        Plot.lineY(aapl, { x: "Date", y: "Close", stroke: "blue" }),
      ],
    });

    containerRef.current.append(plot);
    return () => plot.remove();
  }, [goog, aapl]);

  return <div ref={containerRef} />;
}
