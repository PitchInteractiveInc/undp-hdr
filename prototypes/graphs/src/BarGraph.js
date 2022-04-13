import { useState } from 'react'
import useHDRData from "./useHDRData";
import { extent, range } from 'd3-array'
import { scaleLinear, scaleQuantize } from 'd3-scale'
import { line } from 'd3-shape'
import exportSVG from './exportSVG';
import indicators from './indicators'
import './IndexGraph.scss'
import { useParams } from 'react-router-dom';
import useMPIData from './useMPIData';
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
  const { data, country, index } = props
  const selectedCountry = country


  const dataKey = index.key
  const graphColumns = data.columns.filter(key => {
    let keyRe = new RegExp(`^${dataKey.toLowerCase()}_[0-9]{4}`)
    if (dataKey === 'MPI') {
      keyRe = /^MPI$/i
    }
    return key.toLowerCase().match(keyRe)
  })
  console.log(dataKey, data.columns)
  console.log(graphColumns)
  const filteredData = data.filter(d => d[graphColumns[0]] !== ''
    && (d.ISO3 !== '' || d.Country === 'World'))
  console.log(filteredData)

  const width = 700
  const height = 600
  const margins = { top: 20, right: 30, bottom: 20, left: 40 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom


  const xScale = scaleLinear()
    .domain([0, filteredData.length])
    .range([0, width])

  const yExtent = [0, 1]
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
    }

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

  return (
    <div className='BarGraph'>
      <div>
        <svg fontSize='0.7em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}>

          <g transform={`translate(${margins.left}, ${margins.top})`}>
            {/* <g>{years}</g> */}
            <g>
              <line x1={width} x2={width} y1={0} y2={height} stroke='#A9B1B7' />
              {yScaleTicks}
            </g>
            <g>{bars}</g>
          </g>
        </svg>
      </div>
    </div>
  )
}
