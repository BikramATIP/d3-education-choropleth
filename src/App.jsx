import './App.css'
import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'


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

    // Clear SVG
    d3.select(svgRef.current).selectAll("*").remove();

    // Setup SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid black');

    // Create container
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Setup projection
    const projection = d3.geoAlbersUsa()
      .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], 
        topojson.feature(countyData, countyData.objects.counties));

    const path = d3.geoPath().projection(projection);

    // Convert TopoJSON to GeoJSON
    const counties = topojson.feature(countyData, countyData.objects.counties);

    // Create color scale
    const colorScale = d3.scaleQuantize()
      .domain([
        d3.min(eduData, d => d.bachelorsOrHigher),
        d3.max(eduData, d => d.bachelorsOrHigher)
      ])
      .range(d3.schemeBlues[9]);

    // Draw counties
    g.selectAll('path')
      .data(counties.features)
      .join('path')
      .attr('d', path)
      .attr('class', 'county')
      .attr('fill', d => {
        const fips = d.id;
        const education = eduData.find(item => item.fips === fips);
        return education ? colorScale(education.bachelorsOrHigher) : '#ccc';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5);

  }, [eduData, countyData]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default App
