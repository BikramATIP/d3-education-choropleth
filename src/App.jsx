import './App.css'
import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'


function App() {
const svgRef = useRef();
const [eduData, setEduData] = useState(null)
const [countyData, setCountyData] = useState(null)

useEffect(() => {
async function fetchData() {
 try {
  const [education, counties] = await Promise.all([
    fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
    .then(res => res.json()),
    fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
    .then(res => res.json())
  ])
  setEduData(education)
  setCountyData(counties)
 } catch (error) {
   console.error("There was an errror fetching the data", error)
 }
}
fetchData()
console.log(eduData, countyData)
}, [])

useEffect(() => {
if (!eduData || !countyData) return;

const svg = d3.select(svgRef.current)





},[eduData, countyData])

  return (
    <>
       <svg ref={svgRef} ></svg>
    </>
  )
}

export default App
