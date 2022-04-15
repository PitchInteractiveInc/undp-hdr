
import { scaleLinear } from 'd3-scale'
import './IndexGraph.scss'
import useMPIData from './useMPIData';
import { comparisonColors } from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import GraphColorLegend from './GraphColorLegend';

import { Delaunay } from 'd3-delaunay';
import { useState, useRef } from 'react';
import CountryTooltip from './CountryTooltip';
export default function BarGraphWrapper(props) {
  const { index } = props

  if (index.key === 'MPI') {
    return <MPIBarGraphWrapper {...props} />
  }

  return <BarGraph {...props} />
}

function MPIBarGraphWrapper(props) {
  const { country } = props
  const mpiData = useMPIData()
  if (!mpiData) {
    return null
  }
  const mpiCountry = mpiData.find(d => d.Country === country.Country)
  return <BarGraph {...props} data={mpiData} country={mpiCountry} />
}

function BarGraph(props) {
  const { data, country, index, selectedCountries, graph } = props
  const selectedCountry = country
  const [hoveredPoint, setHoveredPoint] = useState(null)


  const dataKey = index.key
  const graphColumns = getGraphColumnsForKey(data, dataKey)
  // console.log(dataKey, data.columns)
  // console.log(graphColumns)
  const filteredData = data.filter(d => d[graphColumns[0]] !== ''
    && (d.ISO3 !== '' || d.Country === 'World'))
  // console.log(filteredData)

  const width = 700
  const height = 460
  const margins = { top: 20, right: 30, bottom: 20, left: 0 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom


  const xScale = scaleLinear()
    .domain([0, filteredData.length])
    .range([0, width])

  const yMin = Math.min(...filteredData.map(d => +d[graphColumns[0]]))
  const yMax = Math.max(...filteredData.map(d => +d[graphColumns[0]]))
  const yExtent = [yMin, yMax]
  const yScale = scaleLinear()
    .domain(yExtent)
    .range([0, height])

  const sortedData = [...filteredData]
  sortedData.sort((a, b) => {
    const aValue = a[graphColumns[0]]
    const bValue = b[graphColumns[0]]
    return index.key === 'MPI' ? bValue - aValue : aValue - bValue
  })

  const barWidth = width / sortedData.length * 0.8
  const legendRows = [
  ]
  if (selectedCountry) {
    legendRows.push({ row: selectedCountry, color: '#1F5A95' })
  }

  selectedCountries.forEach((iso3, index) => {
    if (iso3 !== '') {
      const country = filteredData.find(d => d.ISO3 === iso3)
      if (country) {
        legendRows.push({ row: country, color: comparisonColors[index] })
      }
    }
  })
  const worldData = data.find(d => d.Country === 'World')
  if (worldData) {
    legendRows.push({ row: worldData, color: '#000', })

  }
  const delaunayData = []

  const bars = sortedData.map((country, i) => {
    const value = +country[graphColumns[0]]
    const x = xScale(i)
    const y = yScale(value)
    let fill = '#EDEFF0'
    let showLabel = false
    if (selectedCountry && country.Country === selectedCountry.Country) {
      fill = '#1F5A95'
      showLabel = true
    } else if (country.Country === 'World') {
      fill = '#000'
      showLabel = true
    } else if (selectedCountries.length > 0) {
      const selectedCountryIndex = selectedCountries.findIndex(d => d === country.ISO3)
      if (selectedCountryIndex !== -1) {
        showLabel = true
        fill = comparisonColors[selectedCountryIndex]
      }
    }
    delaunayData.push([x, height - y, {row: country, col: graphColumns[0]}])


    let label = showLabel ? <text dy='-0.5em'textAnchor='middle' fill={fill} y={height - y}>{value.toFixed(2)}</text> : null
    return (
      <g transform={`translate(${x}, ${0})`} key={i}>
        <rect
          width={barWidth}
          y={height - y}
          height={y}
          fill={fill}
        />
        {label}
      </g>
    )
  })
  const delaunay = Delaunay.from(delaunayData)

  // const saveSVG = (event) => {
  //   exportSVG(event.target.closest('svg'), `${selectedMetric['Full name']}.svg`)
  // }



  const yScaleTicks = yScale.ticks(10).map((tick, index) => {
    const y = yScale(tick)
    return (
      <g key={tick} transform={`translate(${width}, ${height - y})`}>
        <text dy='0.3em' dx='0.5em'>{tick}</text>
        {/* <line x1={-width - xScale(0.5)} x2={-xScale(0.5)} stroke='#A9B1B7' strokeDasharray='4,3' strokeWidth={0.5} /> */}
      </g>
    )
  })

  const svgRef = useRef()
  const mouseMove = (event) => {
    const svgPosition = svgRef.current.getBoundingClientRect()
    const mouseX = event.clientX - svgPosition.left
    const mouseY = event.clientY - svgPosition.top
    const closestPointIndex = delaunay.find(mouseX - margins.left, mouseY - margins.top)
    if (closestPointIndex !== -1) {
      setHoveredPoint({ x: mouseX, y: mouseY, hover: delaunayData[closestPointIndex] })
    }
  }
  const mouseLeave = () => {
    setHoveredPoint(null)
  }

  let tooltip = null
  if (hoveredPoint) {
    tooltip = (
      <CountryTooltip point={hoveredPoint} index={index} data={data} graph={graph} />
    )
  }


  return (
    <div className='BarGraph'>
      <GraphColorLegend rows={legendRows} />
      <div className='svgContainer'>
        <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
          onMouseMove={mouseMove}
          onMouseEnter={mouseMove}
          onMouseLeave={mouseLeave}
          ref={svgRef}>

          <g transform={`translate(${margins.left}, ${margins.top})`}>
            {/* <g>{years}</g> */}
            <g>
              <line x1={width} x2={width} y1={0} y2={height} stroke='#A9B1B7' />
              {yScaleTicks}
            </g>
            <g>{bars}</g>
          </g>
        </svg>
        {tooltip}
      </div>
    </div>
  )
}
