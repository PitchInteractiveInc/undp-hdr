import { useState, useRef } from 'react'
import useHDRData from "./useHDRData";
import { scaleLinear, scaleQuantize } from 'd3-scale'
import exportSVG from './exportSVG';
import downArrow from './images/downArrow.svg'
import { Delaunay } from 'd3-delaunay';
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
import {colors} from './IndexGraph'
import { extent } from 'd3-array';

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

  const ppaKey = 'phdi_2019'
  const hdiKey = 'hdi_2019'


  const countries = data.filter(d => d.ISO3 !== '' && d[hdiKey] !== '' && d[ppaKey] !== '')

  const sortedCountries = [...countries]
  sortedCountries.sort((a, b) => a[ppaKey] - b[ppaKey])

  const width = 800
  const height = 800
  const rowWidth = width / sortedCountries.length
  const barWidth = rowWidth - 2
  const margins = { top: 20, right: 20, bottom: 20, left: 40 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom

  const phdiExtent = extent(sortedCountries, d => d[ppaKey])
  const hdiExtent = extent(sortedCountries, d => d[hdiKey])
  const yScale = scaleLinear()
    .domain([Math.min(phdiExtent[0], hdiExtent[0]), Math.max(phdiExtent[1], hdiExtent[1])])
    .range([0, height])

  let countryDropdowns = <ComparisonCountrySelectors
    selectedCountries={selectedCountries}
    setSelectedCountries={setSelectedCountries}
    countries={countries}
    hideSync={true}
    maxSelectable={3}
    colorByIndexValue={true}
  />

  const colorScale = scaleQuantize()
    .domain(phdiExtent)
    .range(colors)

  const countryBars = sortedCountries.map((country, countryIndex) => {
    const hdiValue = +country[hdiKey]
    const phdiValue = +country[ppaKey]
    const phdiBarHeight = yScale(phdiValue)
    const hdiBarHeight = yScale(hdiValue) - phdiBarHeight
    const x = countryIndex * rowWidth
    let isSelected = selectedCountries.includes(country.ISO3)
    let opacity = 1
    if (countSelectedCountries !== 0) {
      opacity = isSelected ? 1 : 0.2
    }
    return (
      <g key={country.ISO3} transform={`translate(${x}, 0)`} opacity={opacity}>
        <rect x={0} y={height - phdiBarHeight - hdiBarHeight} height={hdiBarHeight} width={barWidth} fill='black' />
        <rect x={0} y={height - phdiBarHeight} height={phdiBarHeight} width={barWidth} fill={colorScale(phdiValue)} />
      </g>
    )

  })

  const yTickArray = yScale.ticks()
  const tickHeight = height / (yTickArray.length - 1)
  const yTicks = yTickArray.map((tick, tickIndex) => {
    const y = height - yScale(tick)

    return <g key={tick} transform={`translate(0, ${y})`}>
      {tickIndex % 2 !== 0 ?
        <rect width={width} height={tickHeight} fill={'#F7F7F7'} />
      : null }
      <text x={-10} y={0} dy={4} textAnchor={'end'}>{tick}</text>
    </g>
  })

  console.log(sortedCountries)
  return (
    <div className='Graph'>
      {countryDropdowns}
      <div>
        <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}>
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <g>{yTicks}</g>
            <g>{countryBars}</g>


            <g id="Group_4458" data-name="Group 4458" transform={`translate(0 ${height})`}>
              <text id="MPI_rank_from_low_to_high" ><tspan x="0" y="13">PHDI rank from low to high</tspan></text>
              <g id="Group_3166" data-name="Group 3166" transform="translate(170 0)">
                <line id="Line_11490" data-name="Line 11490" x2="18" transform="translate(0 8)" fill="none" stroke="#000" strokeWidth="1"/>
                <path id="Polygon_1004" data-name="Polygon 1004" d="M5,0l5,8H0Z" transform="translate(18 3) rotate(90)"/>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}
