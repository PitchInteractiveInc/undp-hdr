import { useState } from 'react'
import useHDRData from "./useHDRData";
import { extent, range } from 'd3-array'
import { scaleLinear, scaleQuantize } from 'd3-scale'
import { line } from 'd3-shape'
import exportSVG from './exportSVG';
import indicators from './indicators'
import './IndexGraph.scss'
import { useParams } from 'react-router-dom';
import { comparisonColors } from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import GraphColorLegend from './GraphColorLegend';
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
export default function DifferenceGraph(props) {
  const { data, country, index, selectedCountries } = props

  const dataKey = index.key
  const graphColumns = getGraphColumnsForKey(data, dataKey)
  console.log(dataKey, data.columns)
  console.log(graphColumns)

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

  console.log(yExtent)

  const rowsToPlot = [
    { row: country, color: '#1F5A95' } ,
    // { row: data.find(d => d.Country === 'World'), color: '#55606F', },
    // { row: data.find(d => d.Country === country.region ), color: '#A9B1B7'}

  ].filter(d => d.row)
  selectedCountries.forEach((iso3, index) => {
    if (iso3) {
      const country = data.find(d => d.ISO3 === iso3)
      if (country) {
        rowsToPlot.push({ row: country, color: comparisonColors[index] })
      }
    }
  })
  console.log(rowsToPlot)
  const yearWidth = xScale(1)
  const markWidth = yearWidth * 0.8
  const differenceData = rowsToPlot.map(row => {
    const dots = []
    const stroke = row.color
    const rowData = graphColumns.map((col, colIndex) => {
      const year = +col.substr(col.lastIndexOf('_') + 1)
      if (row.row[col] === '') {
        return null
      }
      const value = +row.row[col]

      return {
        index: colIndex,
        value,
      }
    }).filter(d => d);
    const differenceMarks = rowData.map((datum, datumIndex) => {
      const x = xScale(datum.index)
      const y = yScale(datum.value)
      let previousYearMarks = null
      if (datumIndex > 0) {
        const prevY = yScale(rowData[datumIndex - 1].value)
        previousYearMarks = (
          <g>
            <line
              x1={-markWidth / 2}
              x2={markWidth / 2}
              y1={prevY}
              y2={prevY}
              stroke={stroke}
              strokeWidth={2}
              strokeDasharray='3,3'
            />
            <rect
              y={Math.min(y, prevY)}
              x={-markWidth / 2}
              width={markWidth}
              height={Math.abs(y - prevY)}
              fill={y < prevY ? '#88E51C' : '#FD9B94'}
            />
          </g>
        )
      }
      return (
        <g key={datumIndex} transform={`translate(${x}, 0)`}>
          <line
            x1={-markWidth / 2}
            x2={markWidth / 2}
            stroke={stroke}
            strokeWidth={2}
            y1={y}
            y2={y}
          />
          {previousYearMarks}
        </g>
      )
    })
    return (
      <g key={row.row.Country}>
        {differenceMarks}
      </g>
    )
  })
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

  return (
    <div className='ScatterGraph'>
      <GraphColorLegend rows={rowsToPlot} />
      <div>
        <svg fontSize='0.7em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}>

          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <g>{years}</g>
            <g>{yScaleTicks}</g>
            <g>{differenceData}</g>
          </g>
        </svg>
      </div>
    </div>
  )
}
