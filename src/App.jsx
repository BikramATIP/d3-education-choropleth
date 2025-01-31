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
   const color = d3.scaleQuantize([1, 10], d3.schemeBlues[9]);
   const path = d3.geoPath();
   const format = d3.format("d");
   const valuemap = new Map(eduData.map(d => [d.fips, d.bachelorsOrHigher]));
   const statemesh = topojson.mesh(countyData, countyData.objects.states, (a, b) => a !== b)
 
   const svg = d3.select(svgRef.current)
     .attr('width', width)
     .attr('height', height);

    const counties = topojson.feature(countyData, countyData.objects.counties).features;

     svg.append('g')
      .selectAll('path')
      .data(topojson.feature(countyData, countyData.objects.counties).features)
      .join('path')
      .attr('fill', d => color(valuemap.get(d.id)))
      .attr('d', path)
      .append('title')
      .text(d => {
        const eduInfo = eduData.find(item => item.fips === d.id);
        return `${eduInfo.area_name}, ${eduInfo.state}: ${eduInfo.bachelorsOrHigher}%`;
      })

      svg.append('path')
       .datum(topojson.mesh(countyData, countyData.objects.states), (a, b) => a !== b)
       .attr('fill', 'none')
       .attr('stroke', 'white')
        .attr('stroke-linejoin', 'round')
        .attr('d', path)

        console.log(color(14.2))
       
  }, [eduData, countyData]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default App
