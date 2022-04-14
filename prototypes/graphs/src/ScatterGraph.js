import { scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'
import './IndexGraph.scss'
import { comparisonColors } from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import GraphColorLegend from './GraphColorLegend';
import { Delaunay } from 'd3-delaunay';
import { useState, useRef } from 'react';
import CountryTooltip from './CountryTooltip';
export const colors = [
  '#d12816',
  '#ee402d',
  '#fbc42d',
  '#6de354',
  '#59ba47',
  '#60d4f2',
  '#21c1fc',
  '#6babeb',
  '#3288ce',
  '#006eb5',
]
export default function ScatterGraph(props) {
  const { data, country, index, selectedCountries, graph } = props

  const dataKey = index.key
  const graphColumns = getGraphColumnsForKey(data, dataKey)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  // console.log(dataKey, data.columns)
  // console.log(graphColumns)

  const width = 700
  const height = 600
  const margins = { top: 20, right: 20, bottom: 20, left: 40 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom

  // const saveSVG = (event) => {
  //   exportSVG(event.target.closest('svg'), `${selectedMetric['Full name']}.svg`)
  // }


  const yearExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  const yExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  data.forEach(country => {
    graphColumns.forEach(col => {
      const value = +country[col]
      if (country[col] !== '') {
        const year = +col.substr(col.lastIndexOf('_') + 1)
        yearExtent[0] = Math.min(yearExtent[0], year)
        yearExtent[1] = Math.max(yearExtent[1], year)
      }
      yExtent[0] = Math.min(yExtent[0], value)
      yExtent[1] = Math.max(yExtent[1], value)
    })
  })

  yExtent[0] = Math.min(0, yExtent[0])
  yExtent[1] = Math.max(1, yExtent[1])

  const xScale = scaleLinear()
    .domain([0, graphColumns.length])
    .range([0, width])

  const yScale = scaleLinear()
    .domain(yExtent)
    .range([height, 0])

  // console.log(yExtent)

  const rowsToPlot = [
    { row: country, color: '#1F5A95' } ,

  ].filter(d => d.row)
  // console.log(rowsToPlot)

  selectedCountries.forEach((iso3, index) => {
    if (iso3) {
      const country = data.find(d => d.ISO3 === iso3)
      if (country) {
        rowsToPlot.push({ row: country, color: comparisonColors[index] })
      }
    }
  })

  const worldData = data.find(d => d.Country === 'World')
  if (worldData) {
    rowsToPlot.push({ row: worldData , color: '#55606F', })
  }
  const regionData = data.find(d => d.Country === country.region )
  if (regionData) {
    rowsToPlot.push({ row: regionData, color: '#A9B1B7'})
  }

  const lineGenerator = line()
    .x(d => xScale(d.index))
    .y(d => yScale(d.value))

  const delaunayData = []
  const lineData = rowsToPlot.map(row => {
    const dots = []
    const stroke = row.color
    const rowData = graphColumns.map((col, colIndex) => {
      const year = +col.substr(col.lastIndexOf('_') + 1)
      if (row.row[col] === '') {
        return null
      }
      const value = +row.row[col]
      const dotX = xScale(colIndex)
      const dotY = yScale(value)
      delaunayData.push([dotX, dotY, {row: row.row, col}])
      dots.push(
        <circle
          r={4}
          key={year}
          cx={dotX}
          cy={dotY}
          fill={stroke}
        />
      )
      return {
        index: colIndex,
        value,
      }
    }).filter(d => d)
    return (
      <g key={row.row.Country}>
        <path d={lineGenerator(rowData)} stroke={stroke} fill='none'></path>
        <g>{dots}</g>
      </g>
    )
  })
  const delaunay = Delaunay.from(delaunayData)

  const years = graphColumns.map((column, columnIndex) => {
    const year = +column.substr(column.lastIndexOf('_') + 1)

    const x = xScale(columnIndex)
    const showYearLines = graphColumns.length > 20
    const showYearRects = !showYearLines
    const everyOtherLabel = showYearLines
    return (
      <g key={year} transform={`translate(${x}, 0)`}>
        {showYearLines ?
          <line y1={height} stroke='#A9B1B7' strokeWidth={0.5} strokeDasharray='4,4' />
          : null }
        {showYearRects ?
          <rect
            width={xScale(1)}
            x={-xScale(1) / 2}
            height={height}
            fill={columnIndex % 2 === 0 ? '#F6F7F7' : 'transparent'}
          />
          : null }
        {!everyOtherLabel || columnIndex % 2 === 0  ?
          <text y={height} dy={'1em'} textAnchor='middle'>{year}</text>
          : null }
      </g>
    )
  })

  const yScaleTicks = yScale.ticks(10).map((tick, index) => {
    const y = yScale(tick)
    return (
      <g key={tick} transform={`translate(${width}, ${y})`}>
        <text dy='0.3em'>{tick}</text>
        <line x1={-width - xScale(0.5)} x2={-xScale(0.5)} stroke='#A9B1B7' strokeDasharray='4,3' strokeWidth={0.5} />
      </g>
    )
  })

  const svgRef = useRef()
  const mouseMove = (event) => {
    const svgPosition = svgRef.current.getBoundingClientRect()
    const mouseX = event.clientX - svgPosition.left
    const mouseY = event.clientY - svgPosition.top
    const closestPointIndex = delaunay.find(mouseX, mouseY)
    console.log(mouseX, mouseY)
    if (closestPointIndex !== -1) {
      console.log(closestPointIndex)
      console.log(delaunayData[closestPointIndex])
      setHoveredPoint({ x: mouseX, y: mouseY, hover: delaunayData[closestPointIndex] })
    }
  }
  const mouseLeave = () => {
    // setHoveredPoint(null)
  }

  let tooltip = null
  if (hoveredPoint) {
    tooltip = (
      <CountryTooltip point={hoveredPoint} index={index} data={data} allRows={rowsToPlot} graph={graph} />
    )
  }

  return (
    <div className='ScatterGraph'>
      <GraphColorLegend rows={rowsToPlot} />
      <div className='svgContainer'>
        <svg fontSize='0.7em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
          onMouseMove={mouseMove}
          onMouseEnter={mouseMove}
          onMouseLeave={mouseLeave}
          ref={svgRef}>

          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <g>{years}</g>
            <g>{yScaleTicks}</g>
            <g>{lineData}</g>
          </g>
        </svg>
        {tooltip}
      </div>
    </div>
  )
}
