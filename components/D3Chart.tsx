import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Player } from '../types';

interface D3ChartProps {
  players: Player[];
}

export const D3Chart: React.FC<D3ChartProps> = ({ players }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    x.domain(players.map(d => d.name));
    y.domain([0, d3.max(players, d => d.score) || 100]);

    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Style X Axis
    xAxis.selectAll("path, line").attr("stroke", "#94A3B8");
    xAxis.selectAll("text").attr("fill", "#F8FAFC").style("font-size", "12px");

    const yAxis = g.append("g")
      .call(d3.axisLeft(y));

    // Style Y Axis
    yAxis.selectAll("path, line").attr("stroke", "#94A3B8");
    yAxis.selectAll("text").attr("fill", "#F8FAFC");

    g.selectAll(".bar")
      .data(players)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name)!)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.score))
      .attr("height", d => height - y(d.score))
      .attr("fill", "#FBBF24") // sl-gold color
      .attr("rx", 4); // Rounded corners

  }, [players]);

  return (
    <div className="flex justify-center w-full h-full">
      <svg ref={svgRef} width={400} height={200}></svg>
    </div>
  );
};
