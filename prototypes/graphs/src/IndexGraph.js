import { useState, useRef } from 'react'
import useHDRData from "./useHDRData";
import { range } from 'd3-array'
import { scaleLinear, scaleQuantize } from 'd3-scale'
import { line } from 'd3-shape'
import exportSVG from './exportSVG';
import indicators from './indicators'
import './IndexGraph.scss'
import { useParams } from 'react-router-dom';
import hdiBackgroundRectData from './hdiBackgroundRectData';
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import RegionFilter from './RegionFilter';
import CountryTooltip from './CountryTooltip';
import { Delaunay } from 'd3-delaunay';
import { type } from '@testing-library/user-event/dist/type';
import getYearOfColumn from './getYearOfColumn';
import HDILabels from './HDILabels';

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
export default function IndexGraph(props) {
  const { data } = useHDRData()
  const { selectedMetricShortName } = useParams()
  const [selectedCountries, setSelectedCountries] = useState(Array.from({length: 3}).map(() => ''))
  const [selectedRegion, setSelectedRegion] = useState('')
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const indicator = indicators.find(d => d.key === selectedMetricShortName)
  const index = indicator
  const svgRef = useRef()
  if (indicator.customGraph) {
    return indicator.customGraph
  }
  // console.log(data)

  if (!data) {
    return null
  }

  const dataKey = indicator.key
  const countSelectedCountries = selectedCountries.filter(d => d !== '').length
  const graphColumns = getGraphColumnsForKey(data, dataKey)
  // console.log(dataKey, data.columns)
  // console.log(graphColumns)

  const width = 1300
  const height = 800
  const margins = { top: 20, right: 20, bottom: 20, left: 40 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom

  const saveSVG = (event) => {
    exportSVG(event.target.closest('svg'), `${indicator.name}.svg`)
  }


  const yearExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  const yExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  data.forEach(country => {
    graphColumns.forEach(col => {
      const value = +country[col]
      if (country[col] !== '') {
        const year = +col.substr(col.lastIndexOf('_') + 1)
        yearExtent[0] = Math.min(yearExtent[0], year)
        yearExtent[1] = Math.max(yearExtent[1], year)
        yExtent[0] = Math.min(yExtent[0], value)
        yExtent[1] = Math.max(yExtent[1], value)
      }
    })
  })
  const countries = data.filter(d => d.ISO3 !== '')

  // console.log(graphColumns)

  const xScale = scaleLinear()
    .domain([0, graphColumns.length - 1])
    .range([0, width])

  const yScale = scaleLinear()
    .domain(yExtent)
    .range([height, 0])

  const colorScale = scaleQuantize()
    .domain(yExtent)
    .range(colors)
  let selectedDots = []
  const delaunayData = []

  const paths = data.filter(d => d.ISO3 !== '' || d.Country === 'World').map(country => {
    const isWorld = country.Country === 'World'
    if (!isWorld && selectedRegion !== '') {
      if (country.region !== selectedRegion) {
        return null
      }
    }
    const data = graphColumns.map((col, colIndex) => {
      if (country[col] === '') {
        return null
      }
      const value = +country[col]
      return {
        value,
        year: getYearOfColumn(col),
        col,
        colIndex,
      }
    }).filter(d => d)

    const lineGen = line()
      .x(d => xScale(d.colIndex))
      .y(d => yScale(d.value))
    if (data.length === 0) {
      return null
    }
    const stroke = isWorld ? 'black' : colorScale(data[0].value)
    const strokeWidth = isWorld ? 2 : 1
    let label = null
    let opacity = 1
    let showLabel = null
    data.forEach(datum => {
      const x = xScale(datum.colIndex)
      const y = yScale(datum.value)
      if (countSelectedCountries === 0 || (selectedCountries.includes(country.ISO3) || isWorld))  {
        delaunayData.push([x, y, {row: country, col: datum.col}])
      }
    })
    if (countSelectedCountries !== 0 && !isWorld) {
      const isSelected = selectedCountries.includes(country.ISO3)
      opacity = isSelected ? 1 : 0.1
      showLabel = isSelected

      if (isSelected) {
        selectedDots.push(<g key={country.ISO3}>
          {data.map(datum => {
            return <circle
              key={datum.year}
              cx={xScale(datum.colIndex)}
              cy={yScale(datum.value)}
              r={3}
              fill={stroke}
              opacity={opacity}
            />
          })}
        </g>)
      }
    }
    if (isWorld) {
      showLabel = true
      opacity = 1
    }
    if (showLabel) {
      const x = xScale(data[0].colIndex)
      label = <text fill={stroke} dx='0.2em' fontWeight='bold' fontSize='1.5em' dy='-1em' x={x} y={yScale(data[0].value)}>{country.Country}</text>

    }
    return (
      <g key={country.ISO3}>
        <path
          opacity={opacity}
          strokeWidth={strokeWidth}
          className='graphPath'
          d={lineGen(data)}
          fill="none"
          stroke={stroke}
          strokeDasharray='1,1'
          style={{ filter: `drop-shadow(0px 0px 3px ${stroke})` }}
        />
        {label}
      </g>
    )
  })
  const delaunay = Delaunay.from(delaunayData)

  const columnWidth = xScale(1)

  const isHDIGraph = index.key === 'HDI'

  const years = graphColumns.map((col, yearIndex) => {
    const year = getYearOfColumn(col)
    const x = xScale(yearIndex)
    let consecutive = false
    if (yearIndex < graphColumns.length - 1) {
      consecutive = (+getYearOfColumn(graphColumns[yearIndex + 1])) === ((+year) + 1)
    } else {
      consecutive = true
    }
    let yearRectWidth = consecutive ? columnWidth : columnWidth * 0.8
    let rectX = -yearRectWidth / 2
    const fill = consecutive ? '#F7F7F7' : '#EDEFF0'
    if (yearIndex === 0) {
      yearRectWidth /= 2
      rectX = 0
    }
    if (yearIndex === graphColumns.length - 1) {
      yearRectWidth /= 2
    }
    const yearRect = isHDIGraph ? null : <rect
      width={yearRectWidth}
      height={height}
      x={rectX}
      fill={fill}
    />

    return (
      <g key={year} transform={`translate(${x}, 0)`}>
        {yearRect}
        <line y1={height} stroke='#A9B1B7' strokeWidth={0.5} strokeDasharray='4,4' />
        <text y={height} dy={'1em'} textAnchor='middle'>{year}</text>
      </g>
    )
  })

  const yScaleBarWidth = 10

  const yScaleTicks = colors.map((color, index) => {
    const percentage = index / colors.length
    const y = (colors.length - index - 1) / colors.length * height
    const barHeight = height / colors.length
    const value = percentage * (yExtent[1] - yExtent[0]) + yExtent[0]
    let lastLabel = null
    if (index === colors.length - 1) {
      let nextValue = (index + 1) / colors.length * (yExtent[1] - yExtent[0]) + yExtent[0]
      lastLabel = <text textAnchor='end' dx='-5' dy='0.3em'>{nextValue.toFixed(1)}</text>
    }
    return (
      <g key={color} transform={`translate(${-yScaleBarWidth}, ${y})`}>
        <rect width={yScaleBarWidth} height={barHeight} fill={color} />
        <text textAnchor='end' y={barHeight} dx='-5' dy='0.3em'>{value.toFixed(2)}</text>
        {lastLabel}
      </g>
    )
  })

  const backgroundRects = isHDIGraph ? hdiBackgroundRectData.map(rect => {
    return (
      <rect
        key={`${rect.fill}-${rect.opacity}`}
        fill={rect.fill}
        opacity={rect.opacity}
        x={0}
        y={height * (1-rect.y1)}
        width={width}
        height={height * (rect.y1 - rect.y0)}
      />
    )
  }) : null

  const countrySelectors = <ComparisonCountrySelectors
    selectedCountries={selectedCountries}
    setSelectedCountries={setSelectedCountries}
    maxSelectable={3}
    countries={countries}
    hideSync
    colorByIndexValue={true}
    indexData={data}
    graphColumns={graphColumns}
    colorScale={colorScale}
  />

  const regionFilter = (
    <RegionFilter
      selectedRegion={selectedRegion}
      setSelectedRegion={setSelectedRegion}
    />
  )

  const mouseMove = (event) => {
    const svgPosition = svgRef.current.getBoundingClientRect()
    const mouseX = event.clientX - svgPosition.left
    const mouseY = event.clientY - svgPosition.top
    const closestPointIndex = delaunay.find(mouseX - margins.left, mouseY - margins.top)
    // console.log(mouseX, mouseY)
    if (closestPointIndex !== -1 && !isNaN(closestPointIndex)) {
      // console.log(closestPointIndex)
      // console.log(delaunayData[closestPointIndex])
      const x = delaunayData[closestPointIndex][0] + margins.left
      const y = delaunayData[closestPointIndex][1] + margins.top
      const clientX = x + svgPosition.left
      setHoveredPoint({ x, y, hover: delaunayData[closestPointIndex], columnWidth, clientX, clientY: event.clientY })
    }
  }
  const mouseLeave = () => {
    setHoveredPoint(null)
  }

  let tooltip = null
  if (hoveredPoint) {
    const graph = {
      type: 'index'
    }
    tooltip = (
      <CountryTooltip point={hoveredPoint} index={index} data={data} allRows={[]} graph={graph} />
    )
  }

  return (
    <div className='IndexGraph'>
      <div className='graphControls' style={{ marginLeft: margins.left - yScaleBarWidth}}>
        <div className='controls'>
          {countrySelectors}
          {regionFilter}
        </div>
        <div style={{ display: 'flex', justifyContent: isHDIGraph ? 'space-between' : null}}>
          <span style={{ fontWeight: '600'}}>Line color - {index.key} in initial year</span>
          {index.lowerBetter ?

            <span className='lowerBetter'>
              {' '}Note: the lower value the country has, the better place it is in {index.key}.
            </span>
          : null}
          {isHDIGraph ? <span>Background color - <HDILabels inline /></span> : null}
        </div>
      </div>
      <div>
        <div className='svgContainer'>

          <svg fontSize='0.6em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
            onMouseMove={mouseMove}
            onMouseEnter={mouseMove}
            onMouseLeave={mouseLeave}
            ref={svgRef}>

            <g transform={`translate(${margins.left}, ${margins.top})`}>
              <g>{backgroundRects}</g>
              <g>{years}</g>
              <g>{yScaleTicks}</g>
              <g>{selectedDots}</g>
              <g>{paths}</g>
            </g>
          </svg>
          {tooltip}
        </div>

      </div>
    </div>
  )
}
