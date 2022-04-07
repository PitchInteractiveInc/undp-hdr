import { useState } from 'react'
import useHDRData from "./useHDRData";
import { extent, range } from 'd3-array'
import { scaleLinear, scaleQuantize } from 'd3-scale'
import { line } from 'd3-shape'
import exportSVG from './exportSVG';
import downArrow from './images/downArrow.svg'

import './Graph.scss'

import {colors} from './Graph'

export default function Graph(props) {
  const { data, metadata } = useHDRData()
  console.log(data, metadata)
  const [selectedCountries, setSelectedCountries] = useState([])
  const countSelectedCountries = selectedCountries.filter(d => d !== '').length

  if (!data || !metadata) {
    return null
  }


  const saveSVG = (event) => {
    exportSVG(event.target.closest('svg'), `PPA-HDI.svg`)
  }

  const ppaKey = 'gdi_2019' // this is not the correct key but we don't have data for the proper one yet
  const hdiKey = 'hdi_2019'


  const countries = data.filter(d => d.ISO3 !== '' && d[hdiKey] !== '')

  const sortedCountries = [...countries]
  sortedCountries.sort((a, b) => b[hdiKey] - a[hdiKey])

  const rowHeight = 7
  const barHeight = 5
  const width = 800
  const height = countries.length * rowHeight
  const margins = { top: 20, right: 20, bottom: 20, left: 40 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom

  const xScale = scaleLinear()
    .domain([0, 1])
    .range([0, width])

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

  const colorScale = scaleQuantize()
    .domain([0, 1])
    .range(colors)

  const countryBars = sortedCountries.map((country, countryIndex) => {
    const hdiValue = +country[hdiKey]
    // const phdiValue = +country[ppaKey]
    const phdiValue = hdiValue * 0.8 // for now just make up phdi values

    const hdiBarWidth = xScale(hdiValue)
    const phdiBarWidth = xScale(phdiValue)
    if (hdiBarWidth === 0) {
      console.log(country)
    }
    const y = countryIndex * rowHeight
    let isSelected = selectedCountries.includes(country.ISO3)
    let opacity = 1
    if (countSelectedCountries !== 0) {
      opacity = isSelected ? 1 : 0.2
    }
    return (
      <g key={country.ISO3} transform={`translate(0, ${y})`} opacity={opacity}>
        <rect x={0} y={0} width={hdiBarWidth} height={barHeight} fill='black' />
        <rect x={0} y={0} width={phdiBarWidth} height={barHeight} fill={colorScale(phdiValue)} />
      </g>
    )

  })


  const xScaleTicks = colors.map((color, index) => {
    const percentage = index / colors.length
    const x = (index) / colors.length * width
    const barWidth = width / colors.length
    const barHeight = 10
    const value = percentage // * (yExtent[1] - yExtent[0]) + yExtent[0]
    let lastLabel = null
    if (index === colors.length - 1) {
      let nextValue = (index + 1) / colors.length  //* (yExtent[1] - yExtent[0]) + yExtent[0]
      lastLabel = <text textAnchor='middle' dy='1em' y={barHeight} x={barWidth}>{nextValue.toFixed(1)}</text>
    }
    return (
      <g key={color} transform={`translate(${x}, ${height})`}>
        {index % 2 === 1 ? <rect fill='#F7F7F7' height={height} y={-height} width={barWidth} /> : null }
        <rect width={barWidth} height={barHeight} fill={color} />
        <text textAnchor='middle' y={barHeight} dy='1em'>{value.toFixed(1)}</text>
        {lastLabel}
      </g>
    )
  })


  return (
    <div className='Graph'>
      {countryDropdowns}
      <div>
        <svg fontSize='0.6em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight} onContextMenu={saveSVG}>
          <text dy='1em'>This graph doesn't yet use real ppa hdi data</text>
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <g>{xScaleTicks}</g>
            <g>{countryBars}</g>
            <text transform={`translate(-16, 0) rotate(90)`}>PHDI rank from high to low</text>
            <image xlinkHref={downArrow} width={23} height={10} transform={`translate(-8, 120) rotate(90)`} />
          </g>
        </svg>
      </div>
    </div>
  )
}
