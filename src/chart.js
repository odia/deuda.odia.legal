export function _colors() {
  return new Map([
    ["LP/EP", "#2A5784"],
    ["Vinyl Single", "#43719F"],
    ["8 - Track", "#5B8DB8"],
    ["Cassette", "#7AAAD0"],
    ["Cassette Single", "#9BC7E4"],
    ["Other Tapes", "#BADDF1"],
    ["Kiosk", "#E1575A"],
    ["CD", "#EE7423"],
    ["CD Single", "#F59D3D"],
    ["SACD", "#FFC686"],
    ["DVD Audio", "#9D7760"],
    ["Music Video (Physical)", "#F1CF63"],
    ["Download Album", "#7C4D79"],
    ["Download Single", "#9B6A97"],
    ["Ringtones & Ringbacks", "#BE89AC"],
    ["Download Music Video", "#D5A5C4"],
    ["Other Digital", "#EFC9E6"],
    ["Synchronization", "#BBB1AC"],
    ["Paid Subscription", "#24693D"],
    ["On-Demand Streaming (Ad-Supported)", "#398949"],
    ["Other Ad-Supported Streaming", "#61AA57"],
    ["SoundExchange Distributions", "#7DC470"],
    ["Limited Tier Paid Subscription", "#B4E0A7"],
  ]);
}

// Make sure to export `colors`
export { _colors as colors };
export { _series as series };

function _series(d3, colors, data) {
  console.log("ESTO", colors.keys());
  return d3
    .stack()
    .keys(colors.keys())
    .value((group, key) => {
      console.log("MIRAR ACA", group, key);
      return group.get(key).value;
    })
    .order(d3.stackOrderReverse)(
      d3
        .rollup(
          data,
          ([d]) => d,
          (d) => d.year,
          (d) => d.name
        )
        .values()
    )
    .map((s) => (s.forEach((d) => (d.data = d.data.get(s.key))), s));
}

export function chart(d3, data, series, colors) {
  const width = 928;
  const height = 500;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 30;

  // Create scales
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.year))
    .rangeRound([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
    .nice()
    .range([height - marginBottom, marginTop]);

  const color = d3.scaleOrdinal().domain(colors.keys()).range(colors.values());

  // Create the SVG container
  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

  // Create the bars
  svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", ({ key }) => color(key))
    .call((g) =>
      g
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
        .attr("x", (d) => x(d.data.year))
        .attr("y", (d) => y(d[1]))
        .attr("width", x.bandwidth() - 1)
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .append("title")
        .text((d) => `${d.data.name}, ${d.data.year}`)
    );

  // Create axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(d3.ticks(...d3.extent(x.domain()), width / 80))
        .tickSizeOuter(0)
    );

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).tickFormat((x) => (x / 1e9).toFixed(0)));

  return Object.assign(svg.node(), { scales: { color } });
}
