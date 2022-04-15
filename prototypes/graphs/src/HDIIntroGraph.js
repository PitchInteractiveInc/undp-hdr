import getGraphColumnsForKey from "./getGraphColumnsForKey"
import getYearOfColumn from "./getYearOfColumn"
import './HDIIntroGraph.scss'
import { scaleThreshold } from "d3-scale"

export default function HDIIntroGraph(props) {
  const { graph, data, country, index } = props
  const selectedCountry = country
  const columns = getGraphColumnsForKey(data, index.key)
  const lastColumn = columns[columns.length - 1]
  const year = getYearOfColumn(lastColumn)

  const colorScale = scaleThreshold()
    .domain([0.55, 0.7, 0.8, 1])
    .range(['#B5D5F5','#6BABEB', '#3288CE', '#1F5A95'])
  const ranks = ['Low', 'Medium', 'High', 'Very high']
  const width = 750
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
  let xThresholds = {}
  const countryBars = countriesSorted.map((country, index) => {
    const x = index * (barWidth + 1)
    let color = colorScale(country[lastColumn])
    if (xThresholds[color] === undefined) {
      xThresholds[color] = x
    }
    let label = null
    let arrow = null
    if (country === selectedCountry) {
      color = '#D12800'
      const rank = countriesSorted.length - index
      const style = { fontWeight: 'bold', textTransform: 'uppercase' }
      const indexPercent = (index / countriesSorted.length)
      const textAnchor = indexPercent < 0.33 ? 'start' : indexPercent < 0.66 ? 'middle' : 'end'
      const textX = indexPercent < 0.33 ? -1 - barWidth : indexPercent < 0.66 ? 0 : barWidth + 1
      label = <text style={style} x={textX} fill={color} textAnchor={textAnchor} dy='-0.7em'>{country.Country}'s HDI Rank: {rank}</text>
      arrow = <path d="M4,0,8,6H0Z" transform="translate(8 6) rotate(180) translate(3, 8)" fill="#d12800"/>

    }
    return (
      <g key={country.ISO3} transform={`translate(${x}, 0)`}>
        <rect width={barWidth} height={height} fill={color} />
        {label}
        {arrow}
      </g>
    )
  })
  return (
    <div className='HDIIntroGraph'>
      <div className='largeStats'>
        <div>
          <div className='label'>HDI Value ({year})</div>
          <div className='value'>{country[lastColumn]}</div>
        </div>
        <div>
          <div className='label'>Human development classification</div>
          <div className='value' style={{ color: colorScale(country[lastColumn])}}>{country.hdicode}</div>
        </div>
        <div>
          <div className='label'>Region</div>
          <div className='value'>{country.region === '' ? 'Not defined' : country.region}</div>
        </div>
      </div>
      <div>
        HDI rank by Human development classification
        <div className='svgContainer'>
          <svg width={width + margins.left + margins.right} height={height + margins.top + margins.bottom}>
            <g transform={`translate(${margins.left}, ${margins.top})`}>
              <g>{countryBars}</g>
              <g>{ranks.map((rank, rankIndex) => {
                const color = colorScale.range()[rankIndex]
                const x = xThresholds[color]
                return <text key={rank} x={x} y={height} dy='1em' fill={color}>{rank}</text>
              })}</g>
              <g>
                <text dy='-0.2em'>{data.length}</text>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )

}
