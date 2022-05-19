import { useState, useRef, useEffect } from 'react'
import useHDRData from "./useHDRData";
import { scaleLinear, scaleQuantize } from 'd3-scale'
import exportSVG from './exportSVG';
import downArrow from './images/downArrow.svg'
import { Delaunay } from 'd3-delaunay';
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
import {colors} from './IndexGraph'
import { extent } from 'd3-array';
import CountryTooltip from './CountryTooltip';
import format from './format';
import { useWindowSize } from 'react-use'
function TextWithBackground(props) {
  const textRef = useRef()
  const [textSize, setTextSize] = useState(null)
  useEffect(() => {
    if (textRef.current) {
      const { width, height } = textRef.current.getBBox()
      if (textSize === null) {
        setTextSize({ width, height })
      } else if (textSize.width !== width || textSize.height !== height) {
        setTextSize({ width, height })
      }
    }
  })
  let rect = null
  if (textSize) {
    rect = <rect
      x={-textSize.width}
      y={-textSize.height}
      width={textSize.width}
      height={textSize.height}
      fill={'#fff'}
      opacity='0.9'
    />
  }
  return <g>
    {rect}
    <text {...props} ref={textRef}>{props.children}</text>
  </g>
}

export default function GraphWrapper(props) {

  const { data, metadata } = useHDRData()

  if (!data || !metadata) {
    return null
  }

  return <Graph {...props} data={data} metadata={metadata} />
}

function Graph(props) {
  const { index, data, metadata } = props

  const [selectedCountries, setSelectedCountries] = useState([])
  const countSelectedCountries = selectedCountries.filter(d => d !== '').length
  const svgRef = useRef()
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const windowSize = useWindowSize()



  const saveSVG = (event) => {
    exportSVG(event.target.closest('svg'), `PPA-HDI.svg`)
  }

  const ppaKey = 'phdi_2019'
  const hdiKey = 'hdi_2019'


  const countries = data.filter(d => d.ISO3 !== '' && d[hdiKey] !== '' && d[ppaKey] !== '')

  const sortedCountries = [...countries]
  sortedCountries.sort((a, b) => a[ppaKey] - b[ppaKey])

  const maxBlockSize = 1392
  const windowWidth = Math.min(maxBlockSize, windowSize.width) - 32 - 20
  let width = windowWidth
  let height = Math.max(windowSize.height * 0.7, 200)
  const margins = { top: 25, right: 0, bottom: 20, left: 50 }
  width -= margins.left + margins.right
  height -= margins.top + margins.bottom
  const rowWidth = width / sortedCountries.length
  const barWidth = rowWidth - 2

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
  const fill = '#b8ecb6'
  const phdiMidpoint = (phdiExtent[0] + phdiExtent[1]) / 2
  const colorScale = scaleLinear()
    .domain([phdiExtent[0], phdiMidpoint, phdiExtent[1]])
    // .range(['#ffbcb7', '#fef17e', '#b8ecb6'])
    .range([fill, fill, fill])
  const delaunayData = []

  const countryBars = sortedCountries.map((country, countryIndex) => {
    const hdiValue = +country[hdiKey]
    const phdiValue = +country[ppaKey]
    const phdiBarHeight = yScale(phdiValue)
    const hdiBarHeight = yScale(hdiValue) - phdiBarHeight
    const x = countryIndex * rowWidth
    let isSelected = selectedCountries.includes(country.ISO3)
    let opacity = 1
    if (hoveredPoint) {
      opacity = hoveredPoint.hover[2].row === country ? 1 : 0.2
    }
    delaunayData.push([x, height / 2, { row: country, col: ppaKey}])
    let label = isSelected ? (
      <g transform={`translate(${barWidth / 2}, ${height - phdiBarHeight - hdiBarHeight - 5})`}>
        <TextWithBackground fontWeight='600' x={4} y={-6} textAnchor='end'>{country.Country} {format(phdiValue)}</TextWithBackground>
        <circle cx={0} cy={0} r={2} fill={'black'} />
      </g>
    ) : null
    return (
      <g key={country.ISO3} transform={`translate(${x}, 0)`} opacity={opacity}>
        <rect x={0} y={height - phdiBarHeight - hdiBarHeight} height={hdiBarHeight} width={barWidth} fill='black' />
        <rect x={0} y={height - phdiBarHeight} height={phdiBarHeight} width={barWidth} fill={colorScale(phdiValue)} />
        {label}
      </g>
    )

  })
  const delaunay = Delaunay.from(delaunayData)

  const yTickArray = yScale.ticks()
  const tickHeight = height / (yTickArray.length - 1)
  const yTicks = yTickArray.map((tick, tickIndex) => {
    const y = height - yScale(tick)

    return <g key={tick} transform={`translate(0, ${y})`}>
      {tickIndex % 2 !== 0 ?
        <rect width={width} height={tickHeight} fill={'#F7F7F7'} />
      : null }
      <text x={-10} y={0} dy={4} textAnchor={'end'}>{format(tick)}</text>
    </g>
  })


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
      const y = mouseY
      const clientX = x + svgPosition.left
      setHoveredPoint({ x, y, hover: delaunayData[closestPointIndex], columnWidth: rowWidth * 2, clientX, clientY: event.clientY })
    }
  }

  const mouseLeave = () => {
    if (hoveredPoint) {
      setHoveredPoint({... hoveredPoint, unmount: true })
    }
  }
  useEffect(() => {
    let id = null
    if (hoveredPoint && hoveredPoint.unmount) {
      id = setTimeout(() => {
        setHoveredPoint(null)
      }, 500)
    }
    return () => {
      clearTimeout(id)
    }
  }, [hoveredPoint])

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
    <div className='Graph' style={{ width: width + margins.left + margins.right}}>
      {countryDropdowns}
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <span style={{ fontWeight: '600', marginLeft: margins.left, transform: 'translateY(20px)'}}>PHDI value</span>
        <svg
          xmlns="http://www.w3.org/2000/svg" xmlnslink="http://www.w3.org/1999/xlink" width="652.517" height="20" viewBox="0 0 652.517 20"
          fontFamily='proxima-nova, "Proxima Nova", sans-serif'
          transform='translate(0, 5)'
          fontSize='16'
          >
          {/* <text id="PHDI_rank" data-name="PHDI rank" font-size="16" font-weight="600"><tspan x="0" y="15">PHDI rank</tspan></text> */}
          <text id="Loss_from_HDI" data-name="Loss from HDI" transform="translate(475.087)" fontWeight="600"><tspan x="0" y="15">Loss from HDI</tspan></text>
          <path id="Path_31967" data-name="Path 31967" d="M0,0H64.43V5.1H0Z" transform="translate(652.517 12) rotate(180)"/>
          {/* <rect id="Rectangle_25574" data-name="Rectangle 25574" width="300" height="8.57" transform="translate(116 6.43)" fill="url(#linear-gradient)"/> */}
          {/* <text id="low" transform="translate(108 1.5)" font-size="14"><tspan x="-21.434" y="13">low</tspan></text>
          <text id="high" transform="translate(424 1.5)" font-size="14"><tspan x="0" y="13">high</tspan></text> */}
        </svg>

      </div>
      <div className='svgContainer'>
        <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
          onMouseMove={mouseMove}
          onMouseEnter={mouseMove}
          onMouseLeave={mouseLeave}
          ref={svgRef}>
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <g>{yTicks}</g>
            <g>{countryBars}</g>
            <line y2={height} stroke='#000' strokeWidth={'0.5'} />

            <g id="Group_4458" data-name="Group 4458" transform={`translate(0 ${height + 5})`}>
              <text id="MPI_rank_from_low_to_high" ><tspan x="0" y="13">PHDI rank from low to high</tspan></text>
              <g id="Group_3166" data-name="Group 3166" transform="translate(170 0)">
                <line id="Line_11490" data-name="Line 11490" x2="18" transform="translate(0 8)" fill="none" stroke="#000" strokeWidth="1"/>
                <path id="Polygon_1004" data-name="Polygon 1004" d="M5,0l5,8H0Z" transform="translate(18 3) rotate(90)"/>
              </g>
            </g>
          </g>
        </svg>
        {tooltip}
      </div>
    </div>
  )
}
