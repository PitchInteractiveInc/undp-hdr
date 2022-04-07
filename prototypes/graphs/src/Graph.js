import { useState } from 'react'
import useHDRData from "./useHDRData";
import { extent, range } from 'd3-array'
import { scaleLinear, scaleQuantize } from 'd3-scale'
import { line } from 'd3-shape'
import exportSVG from './exportSVG';

import './Graph.scss'

const colors = [
  '#d12816',
  '#ee402d',
  '#fbc42d',
  '#feeb34',
  '#6de354',
  '#59ba47',
  '#60d4f2',
  '#21c1fc',
  '#6babeb',
  '#3288ce',
]
export default function Graph(props) {
  const { data, metadata } = useHDRData()
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(4)
  const [selectedCountries, setSelectedCountries] = useState([])
  console.log(data, metadata)

  if (!data || !metadata) {
    return null
  }

  const selectedMetric = metadata[selectedMetricIndex]
  const dataKey = selectedMetric['Short name']
  const countSelectedCountries = selectedCountries.filter(d => d !== '').length
  const graphColumns = data.columns.filter(key => {
    const keyRe = new RegExp(`^${dataKey.toLowerCase()}_[0-9]{4}`)
    return key.toLowerCase().match(keyRe)
  })
  console.log(graphColumns)

  const width = 800
  const height = 800
  const margins = { top: 20, right: 20, bottom: 20, left: 40 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom

  const saveSVG = (event) => {
    exportSVG(event.target.closest('svg'), `${selectedMetric['Full name']}.svg`)
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
      }
      yExtent[0] = Math.min(yExtent[0], value)
      yExtent[1] = Math.max(yExtent[1], value)
    })
  })
  const countries = data.filter(d => d.ISO3 !== '')

  console.log(yExtent)
  if (selectedMetric['Full name'].includes('Index')) {
    yExtent[0] = Math.min(0, yExtent[0])
    yExtent[1] = Math.max(1, yExtent[1])
  }

  console.log(yExtent)

  const xScale = scaleLinear()
    .domain(yearExtent)
    .range([0, width])

  const yScale = scaleLinear()
    .domain(yExtent)
    .range([height, 0])

  console.log(yExtent)
  // const lineGen = line()
  //   .x(d => xScale())

  const colorScale = scaleQuantize()
    .domain(yExtent)
    .range(colors)

  const paths = data.filter(d => d.ISO3 !== '' || d.Country == 'World').map(country => {
    const data = graphColumns.map(col => {
      if (country[col] === '') {
        return null
      }
      const value = +country[col]
      return {
        value,
        year: +col.substr(col.lastIndexOf('_') + 1)
      }
    }).filter(d => d)

    const lineGen = line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value))
    if (data.length === 0) {
      return null
    }
    const isWorld = country.Country === 'World'
    const stroke = isWorld ? 'black' : colorScale(data[0].value)
    const strokeWidth = isWorld ? 2 : 1
    let label = null
    let opacity = 1
    let showLabel = null
    if (countSelectedCountries !== 0) {
      const isSelected = selectedCountries.includes(country.ISO3)
      opacity = isSelected ? 1 : 0.1
      showLabel = isSelected
    }
    if (isWorld) {
      showLabel = true
      opacity = 1
    }
    if (showLabel) {
      const x = xScale(data[0].year)
        label = <text dy='-1em' x={x} y={yScale(data[0].value)}>{country.Country}</text>
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

  const yearArray = range(yearExtent[0], yearExtent[1] + 1)

  const years = yearArray.map(year => {
    const x = xScale(year)
    return (
      <g key={year} transform={`translate(${x}, 0)`}>
        <line y1={height} stroke='#A9B1B7' strokeWidth={0.5} strokeDasharray='4,4' />
        <text y={height} dy={'1em'} textAnchor='middle'>{year}</text>
      </g>
    )
  })

  const yScaleTicks = colors.map((color, index) => {
    const percentage = index / colors.length
    const y = (colors.length - index - 1) / colors.length * height
    const barHeight = height / colors.length
    const barWidth = 10
    const value = percentage * (yExtent[1] - yExtent[0]) + yExtent[0]
    let lastLabel = null
    if (index === colors.length - 1) {
      let nextValue = (index + 1) / colors.length * (yExtent[1] - yExtent[0]) + yExtent[0]
      lastLabel = <text textAnchor='end' dx='-5' dy='0.3em'>{nextValue.toFixed(1)}</text>
    }
    return (
      <g key={color} transform={`translate(${-barWidth}, ${y})`}>
        <rect width={barWidth} height={barHeight} fill={color} />
        <text textAnchor='end' y={barHeight} dx='-5' dy='0.3em'>{value.toFixed(1)}</text>
        {lastLabel}
      </g>
    )
  })

  const backgroundRects = [
    {
      fill: '#DBDDE0',
      y0: 0,
      y1: 0.35,
    },
    {
      fill: '#E5E6E8',
      y0: 0.35,
      y1: 0.55,
    },
    {
      fill: '#EDEEF0',
      y0: 0.55,
      y1: 0.75,
    },
    {
      fill: '#F6F6F7',
      y0: 0.75,
      y1: 1,
    }
  ].map(rect => {
    return (
      <rect
        key={rect.fill}
        fill={rect.fill}
        x={0}
        y={height * (1-rect.y1)}
        width={width}
        height={height * (rect.y1 - rect.y0)}
      />
    )
  })

  let countryDropdowns = <div>
    {range(3).map(i => {
    const value = selectedCountries[i] || ''
    const setCountry = (iso) => {
      const newSelectedCountries = [...selectedCountries]
      newSelectedCountries[i] = iso

      setSelectedCountries(newSelectedCountries)
    }
    return <select key={i} placeholder='Select a country' value={value} onChange={e => setCountry(e.target.value)}>
        <option value=''>Select a country</option>
        {countries.map(country => {
          return <option key={country.ISO3} value={country.ISO3}>{country.Country}</option>
        })}
      </select>

    })}
  </div>
  return (
    <div className='Graph'>
      <div>
        <select value={selectedMetricIndex} onChange={e => setSelectedMetricIndex(e.target.value)}>
          {metadata.map((d, i) => {
            if (!d['Full name'].includes('Index')) {
              return null
            }
            return <option key={i} value={i}>{d['Full name']}</option>
          })}
        </select>
        <br />
        {countryDropdowns}
      </div>
      <div>
        <svg fontSize='0.6em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight} onContextMenu={saveSVG}>

          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <g>{backgroundRects}</g>
            <g>{yScaleTicks}</g>
            <g>{paths}</g>
            <g>{years}</g>
          </g>
        </svg>
      </div>
    </div>
  )
}
