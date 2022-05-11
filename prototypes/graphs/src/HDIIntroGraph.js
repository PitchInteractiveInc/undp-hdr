import getGraphColumnsForKey from "./getGraphColumnsForKey"
import getYearOfColumn from "./getYearOfColumn"
import './HDIIntroGraph.scss'
import { scaleThreshold } from "d3-scale"
import { Delaunay } from "d3-delaunay"
import { useState, useRef, useEffect } from "react"
import CountryTooltip from "./CountryTooltip"
import { regions } from "./RegionFilter"
import { useNavigate } from "react-router-dom"
export const hdiIntroColorScale = scaleThreshold()
  .domain([0.55, 0.7, 0.8, 1])
  .range(['#B5D5F5','#6BABEB', '#3288CE', '#1F5A95'])
export const hdiRanks = ['Low', 'Medium', 'High', 'Very high']

export default function HDIIntroGraph(props) {
  const { data, country, index, width } = props
  const selectedCountry = country
  const columns = getGraphColumnsForKey(data, index.key)
  const lastColumn = columns[columns.length - 1]
  const year = getYearOfColumn(lastColumn)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const height = 55
  const margins = { top: 30, right: 0, bottom: 30, left: 0 }
  const countriesSorted = [...data]
    .filter(d => d.ISO3 !== '')
  countriesSorted.sort((a, b) => {
    const aValue = a[lastColumn]
    const bValue = b[lastColumn]
    return aValue - bValue
  })
  const barWidth = 2
  const totalCountryWidth = barWidth * countriesSorted.length
  const totalGapWidth = width - totalCountryWidth
  const gapWidth = totalGapWidth / (countriesSorted.length - 1)
  let xThresholds = {}
  const delaunayData = []
  const countryBars = countriesSorted.map((country, index) => {
    const x = index * (barWidth + gapWidth)
    let color = hdiIntroColorScale(country[lastColumn])
    if (xThresholds[color] === undefined) {
      xThresholds[color] = x
    }
    let label = null
    let arrow = null
    delaunayData.push([x, height / 2, { row: country, col: lastColumn}])
    if (country === selectedCountry) {
      color = '#D12800'
      const rank = country[`hdi_rank_${year}`]
      const style = { fontWeight: 'bold', textTransform: 'uppercase' }
      const indexPercent = (index / countriesSorted.length)
      const textAnchor = indexPercent < 0.33 ? 'start' : indexPercent < 0.66 ? 'middle' : 'end'
      const textX = indexPercent < 0.33 ? -1 - barWidth : indexPercent < 0.66 ? 0 : barWidth + 1
      label = <text style={style} x={textX} fill={color} textAnchor={textAnchor} dy='-0.7em'>{country.Country}'s HDI Rank: {rank}</text>
      arrow = <path d="M4,0,8,6H0Z" transform="translate(8 6) rotate(180) translate(3, 8)" fill="#d12800"/>

    }
    let opacity = null
    if (hoveredPoint) {
      if (hoveredPoint.hover[2].row === country) {
        opacity = 1
      } else {
        opacity = 0.3
      }
    }
    return (
      <g key={country.ISO3} opacity={opacity} transform={`translate(${x}, 0)`}>
        <rect width={barWidth} height={height} fill={color} />
        {label}
        {arrow}
      </g>
    )
  })
  const delaunay = Delaunay.from(delaunayData)

  const svgRef = useRef()
  const mouseMove = (event) => {
    const svgPosition = svgRef.current.getBoundingClientRect()
    const mouseX = event.clientX - svgPosition.left
    const mouseY = event.clientY - svgPosition.top
    const closestPointIndex = delaunay.find(mouseX - margins.left, mouseY - margins.top)
    if (closestPointIndex !== -1) {
      // console.log(closestPointIndex, delaunayData[closestPointIndex])
      const x = delaunayData[closestPointIndex][0]
      setHoveredPoint({ x, y: mouseY, hover: delaunayData[closestPointIndex], columnWidth: 10, clientX: event.clientX, clientY: event.clientY })
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
    tooltip = (
      <CountryTooltip point={hoveredPoint} index={index} data={data} graph={{type: 'hdiIntro'}} />
    )
  }

  let regionText = '–'
  if (country.region !== '') {
    const region = regions.find(r => r.id === country.region)
    regionText = region.name
  }


  const navigate = useNavigate()

  const clickGraph = () => {
    if (hoveredPoint) {
      const clickedCountry = hoveredPoint.hover[2].row
      const iso3 = clickedCountry.ISO3
      if (country && iso3 && country.ISO3 !== iso3) {
        navigate(`/countries/${iso3}`, { replace: true })
      }
    }
  }
  const cursor = hoveredPoint && hoveredPoint.hover[2].row.ISO3 && hoveredPoint.hover[2].row.ISO3 !== country.ISO3 ? 'pointer' : 'default'


  return (
    <div className='HDIIntroGraph'>
      <div className='largeStats'>
        <div>
          <div className='largeStatLabel'>HDI Value ({year})</div>
          <div className='value'>{country[lastColumn]}</div>
        </div>
        <div>
          <div className='largeStatLabel'>Human development classification</div>
          <div className='value' style={{ color: hdiIntroColorScale(country[lastColumn])}}>{country.hdicode}</div>
        </div>
        <div>
          <div className='largeStatLabel'>Developing Region</div>
          <div className='value'>{regionText}</div>
        </div>
      </div>
      <div>
        <div className='svgContainer'>
          <svg width={width + margins.left + margins.right} height={height + margins.top + margins.bottom}
            onMouseMove={mouseMove}
            onMouseEnter={mouseMove}
            onMouseLeave={mouseLeave}
            ref={svgRef}
            onClick={clickGraph}
            style={{ cursor }}
            >
            <g transform={`translate(${margins.left}, ${margins.top})`}>
              <g>{countryBars}</g>
              <g>{hdiRanks.map((rank, rankIndex) => {
                const color = hdiIntroColorScale.range()[rankIndex]
                const x = xThresholds[color]
                return <text key={rank} x={x} y={height} dy='1em' fill={color}>{rank}</text>
              })}</g>
              {/* <g>
                <text dy='-0.2em'>{data.length}</text>
              </g> */}
            </g>
          </svg>
          {tooltip}
        </div>
      </div>
    </div>
  )

}
