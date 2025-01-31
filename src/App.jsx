import './App.css'
import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import * as Plot from "@observablehq/plot"


function App() {
  const svgRef = useRef();
  const [eduData, setEduData] = useState(null);
  const [countyData, setCountyData] = useState(null);

  const width = 960;
  const height = 600;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  useEffect(() => {
    async function fetchData() {
      try {
        const [education, counties] = await Promise.all([
          fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
            .then(res => res.json()),
          fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
            .then(res => res.json())
        ]);
        setEduData(education);
        setCountyData(counties);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!eduData || !countyData) return;
    
    const minEdu = d3.min(eduData, d => d.bachelorsOrHigher);
    const maxEdu = d3.max(eduData, d => d.bachelorsOrHigher);

    const colorScale = d3.scaleQuantize()
        .domain([minEdu, maxEdu])
        .range(d3.schemeBlues[8]);
    
    const path = d3.geoPath();
    const valuemap = new Map(eduData.map(d => [d.fips, d.bachelorsOrHigher]));
    
    const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);
    
    const tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('padding', '10px')
        .style('border', '1px solid black')
        .style('border-radius', '5px');
    
    svg.append('g')
        .selectAll('path')
        .data(topojson.feature(countyData, countyData.objects.counties).features)
        .join('path')
        .attr('fill', d => colorScale(valuemap.get(d.id)))
        .attr('d', path)
        .attr('class', 'county')
        .attr('data-fips', d => d.id)
        .attr('data-education', d => valuemap.get(d.id))
        .on('mouseover', (event, d) => {
            const eduInfo = eduData.find(item => item.fips === d.id);
            tooltip.style('opacity', 0.9)
                .html(`${eduInfo.area_name}, ${eduInfo.state}: ${eduInfo.bachelorsOrHigher}%`)
                .attr('data-education', eduInfo.bachelorsOrHigher)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });
    
    const legendSvg = Plot.legend({
        color: {
            type: "quantize",
            n: 6, 
            domain: [minEdu, maxEdu],
            range: d3.schemeBlues[6]
        },
      tickFormat: d => d.toFixed(0) + "%",
    });

    const legendContainer = svg.append('g')
      .attr('class', 'legend-container')
      .attr('id', 'legend')
      .attr('transform', `translate(${width - 350}, ${margin.top})`)
      .style('text-align', 'center')
      .attr('stoke', 'black')
      .attr('stroke-width', 1)
      .attr('rx', 5)

    legendContainer.append('text')
    .attr('x', 130)  
    .attr('y', 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('font-family', 'Arial')
    .text("Bachelor's or Higher (%)")

    legendContainer.append('rect')
   
    legendContainer.append(() => legendSvg);

  }, [eduData, countyData]);

  return (
    <div>
      <h1 id="title">United States Education Attainment</h1>
      <h3 id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h3>
      <svg ref={svgRef}></svg>
      <span id="source">Source: <a href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx">
      USDA Economic Research Service</a></span>
    </div>
  );
}

export default App
