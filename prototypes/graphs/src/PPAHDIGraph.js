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
  const margins = { top: 20, right: 0, bottom: 20, left: 40 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom

  const phdiExtent = extent(sortedCountries, d => +d[ppaKey])
  const hdiExtent = extent(sortedCountries, d => +d[hdiKey])
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

  const phdiMidpoint = (phdiExtent[0] + phdiExtent[1]) / 2
  const colorScale = scaleLinear()
    .domain([phdiExtent[0], phdiMidpoint, phdiExtent[1]])
    .range(['#ffbcb7', '#fef17e', '#b8ecb6'])

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
    <div className='Graph' style={{ width: width + margins.left + margins.right}}>
      {countryDropdowns}
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <span style={{ fontWeight: '600'}}>PHDI Value</span>
        <svg
          xmlns="http://www.w3.org/2000/svg" xmlnslink="http://www.w3.org/1999/xlink" width="652.517" height="20" viewBox="0 0 652.517 20"
          fontFamily='proxima-nova, "Proxima Nova", sans-serif'
          transform='translate(0, 5)'
          >
          <defs>
            <linearGradient id="linear-gradient" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
              <stop offset="0" stop-color="#febcb8"/>
              <stop offset="0.493" stop-color="#fee085"/>
              <stop offset="1" stop-color="#b9ebb8"/>
            </linearGradient>
          </defs>
          <text id="PHDI_rank" data-name="PHDI rank" font-size="16" font-weight="600"><tspan x="0" y="15">PHDI rank</tspan></text>
          <text id="Loss_from_HDI" data-name="Loss from HDI" transform="translate(475.087)" font-size="16" font-weight="600"><tspan x="0" y="15">Loss from HDI</tspan></text>
          <path id="Path_31967" data-name="Path 31967" d="M0,0H64.43V8.57H0Z" transform="translate(652.517 15) rotate(180)"/>
          <rect id="Rectangle_25574" data-name="Rectangle 25574" width="300" height="8.57" transform="translate(116 6.43)" fill="url(#linear-gradient)"/>
          <text id="low" transform="translate(108 1.5)" font-size="14"><tspan x="-21.434" y="13">low</tspan></text>
          <text id="high" transform="translate(424 1.5)" font-size="14"><tspan x="0" y="13">high</tspan></text>
        </svg>

      </div>
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
