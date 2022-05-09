import { useState, useRef, useMemo } from 'react'
import useMPIData from "./useMPIData";
import { range, max, mean, sum } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import exportSVG from './exportSVG';
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
import { Delaunay } from 'd3-delaunay';
import CountryTooltip from './CountryTooltip';
import format from './format';
export const mpiColors = {
  'Child mortality': '#1f5a95',
  'Nutrition': '#006eb5',
  'Sanitation': '#3288ce',
  'Years of schooling': '#4f95dd',
  'School attendance': '#6babeb',
  'Drinking water': '#94c4f5',
  'Electricity': '#b5d5f5',
  'Cooking fuel': '#a9b1b7',
  'Assets': '#55606f',
  'Housing': '#232E3E'
}
const metrics = Object.keys(mpiColors)
export default function MPIGraphWrapper(props) {
  const mpiData = useMPIData()
  if (!mpiData) {
    return null
  }
  return <MPIGraph {...props} mpiData={mpiData} />
}
function MPIGraph(props) {
  const { index, mpiData } = props
  const [selectedCountries, setSelectedCountries] = useState([])
  const svgRef = useRef()
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [hoveredMetric, setHoveredMetric] = useState(null)
  const countSelectedCountries = selectedCountries.filter(d => d !== '').length

  const mpiKey = 'MPI'
  const countries = mpiData.filter(d => d.ISO3 !== '' && d[mpiKey] !== '')
  const sortedCountries = [...countries]
  sortedCountries.sort((a, b) => b[mpiKey] - a[mpiKey])

  const width = 800
  const height = 800
  const rowWidth = width / sortedCountries.length
  const barWidth = rowWidth - 2
  const margins = { top: 20, right: 20, bottom: 25, left: 50 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom


  let countryDropdowns = <ComparisonCountrySelectors
    selectedCountries={selectedCountries}
    setSelectedCountries={setSelectedCountries}
    countries={countries}
    hideSync={true}
    maxSelectable={3}
    colorByIndexValue={true}
  />

  const yMax = max(countries, d => d[mpiKey])
  const yScale = scaleLinear()
    .domain([0, yMax])
    .range([0, height])

  const delaunayData = []
  const averages = useMemo(() => {
    const averages = {}
    metrics.forEach(metric => {
      averages[metric]  = mean(countries , d => d[metric])
    })
    return averages
  }, [countries])
  console.log(averages)
  const countryBars = sortedCountries.map((country, countryIndex) => {
    const totalBarHeight = yScale(country[mpiKey])

    let runningY = height
    let opacity = null
    const hasSelection = countSelectedCountries > 0
    const isSelected = hasSelection && selectedCountries.includes(country.ISO3)

    if (hoveredPoint) {
      if (hoveredPoint.hover[2].row === country) {
        opacity = 1
      } else {
        opacity = 0.2
      }
    }

    const metricBars = metrics.map(metric => {
      const y = runningY
      const metricPercentage = country[metric]
      const rectHeight = totalBarHeight * (metricPercentage / 100)
      runningY -= rectHeight
      let barOpacity = 1
      if (hoveredMetric) {
        barOpacity = hoveredMetric === metric ? 1 : 0.2
      }
      return (
        <rect
          key={metric}
          width={barWidth}
          height={rectHeight}
          y={y - rectHeight}
          fill={mpiColors[metric]}
          opacity={barOpacity}
        />
      )
    })
    const x = countryIndex * rowWidth
    delaunayData.push([x, height / 2, {row: country, col: mpiKey}])
    let label = null
    if (isSelected) {
      label = (
        <g transform={`translate(${barWidth / 2}, ${runningY - 5})`}>
          <circle cx={0} cy={0} r={2} fill={'black'} />
          <text fontWeight='600' x={-2} y={-6} fill="black">{country.Country} {format(country[mpiKey])}</text>
        </g>
      )
    }
    return <g opacity={opacity} key={country.ISO3} transform={`translate(${x}, 0)`}>
      {/* <rect x={0}
        width={width} height={barHeight}
        fill={'black'}
      /> */}
      {metricBars}
      {label}
    </g>
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
    setHoveredPoint(null)
  }

  let tooltip = null
  if (hoveredPoint) {
    const graph = {
      type: 'index'
    }
    tooltip = (
      <CountryTooltip point={hoveredPoint} index={index} data={mpiData} allRows={[]} graph={graph} />
    )
  }

  const metricGraphHeight = 40
  const metricGraphBarHeight = 20

  const metricGraphSum = sum(metrics, metric => averages[metric])
  const metricGraphBarPadding = 5
  const metricGraphBarTotalPadding = metricGraphBarPadding * (metrics.length - 1)
  const metricGraphBarWidth = svgWidth - metricGraphBarTotalPadding
  const metricGraphXScale = scaleLinear()
    .domain([0, metricGraphSum])
    .range([0, metricGraphBarWidth])

  let runningX = 0
  const hoverMetric = (metric) => () => {
    setHoveredMetric(metric)
  }
  const masks = []
  const metricGraphBars = metrics.map((metric, metricIndex) => {
    const value = averages[metric]
    const barWidth = metricGraphXScale(value)
    const x = runningX
    runningX += barWidth + metricGraphBarPadding
    const maskId = `mpiMask${metricIndex}`
    masks.push(
      <clipPath id={maskId} key={metricIndex} >
        <rect key={metric} x={x} y={0} width={barWidth} height={metricGraphHeight} fill='#333' />
      </clipPath>
    )
    const textOpacity = !hoveredMetric || (hoveredMetric === metric) ? 1 : 0
    const clipPathId = hoveredMetric && (hoveredMetric === metric) ? null : `url(#${maskId})`
    return (
      <g key={metric} clipPath={clipPathId}>
        <g transform={`translate(${x}, 10)`}  onMouseOver={hoverMetric(metric)} onMouseOut={hoverMetric(null)}>

          <text opacity={textOpacity} fontSize='0.8em' fontWeight='600' dy={'-0.2em'}>{metric}</text>

          <rect width={barWidth} height={metricGraphBarHeight} fill={mpiColors[metric]} />
          <text style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'}} fontWeight='600' x={barWidth} dx={'-0.2em'} y={metricGraphBarHeight - 5} textAnchor={'end'} fill='#fff'>{format(value, 'mpi')}%</text>
        </g>
      </g>
    )
  })
  return (
    <div className='IndexGraph'>
      <div>
        {countryDropdowns}
      </div>
      <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5em'}}>
        MPI INDICES Performance
      </div>
      <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={metricGraphHeight}>
        <defs>
          {masks}
        </defs>

        {metricGraphBars}
      </svg>
      <div style={{ marginLeft: margins.left}}>
        <span style={{ fontWeight: '600'}}>{index.key}</span>
        {index.lowerBetter ?

          <span className='lowerBetter'>
            {' '}Note: the lower {index.key} value results in higher {index.key} rank.
          </span>
        : null}
      </div>
      <div>
        <div className='svgContainer'>
          <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
            onMouseMove={mouseMove}
            onMouseEnter={mouseMove}
            onMouseLeave={mouseLeave}
            ref={svgRef}>

            <g transform={`translate(${margins.left}, ${margins.top})`}>
              <line x1={0} y1={0} x2={0} y2={height} stroke='black' strokeWidth='1' />
              <line x1={0} y1={height} x2={width} y2={height} stroke='black' strokeWidth='1' />
              <g>{yTicks}</g>
              <g>{countryBars}</g>

              <g id="Group_4458" data-name="Group 4458" transform={`translate(0 ${height + 5})`}>
                <text id="MPI_rank_from_low_to_high" data-name="MPI rank from low to high" ><tspan x="0" y="13">MPI rank from low to high</tspan></text>
                <g id="Group_3166" data-name="Group 3166" transform="translate(160 0)">
                  <line id="Line_11490" data-name="Line 11490" x2="18" transform="translate(0 8)" fill="none" stroke="#000" strokeWidth="1"/>
                  <path id="Polygon_1004" data-name="Polygon 1004" d="M5,0l5,8H0Z" transform="translate(18 3) rotate(90)"/>
                </g>
              </g>

            </g>

          </svg>
          {tooltip}
        </div>
      </div>
    </div>
  )
}
