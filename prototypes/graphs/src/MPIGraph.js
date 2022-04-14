import { useState } from 'react'
import useMPIData from "./useMPIData";
import { range, max } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import exportSVG from './exportSVG';

const mpiColors = {
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

export default function MPIGraph(props) {
  const mpiData = useMPIData()
  const [selectedCountries, setSelectedCountries] = useState([])

  if (!mpiData) {
    return null
  }

  const countSelectedCountries = selectedCountries.filter(d => d !== '').length



  const saveSVG = (event) => {
    exportSVG(event.target.closest('svg'), `MPI Index.svg`)
  }

  const mpiKey = 'MPI'
  const countries = mpiData.filter(d => d.ISO3 !== '' && d[mpiKey] !== '')
  const sortedCountries = [...countries]
  sortedCountries.sort((a, b) => a[mpiKey] - b[mpiKey])

  const rowHeight = 7
  const barHeight = 5
  const width = 800
  const height = countries.length * rowHeight
  const margins = { top: 20, right: 20, bottom: 20, left: 40 }
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom


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
          return <option key={country.Country} value={country.Country}>{country.Country}</option>
        })}
      </select>

    })}
  </div>

  const xMax = max(countries, d => d[mpiKey])
  const xScale = scaleLinear()
    .domain([0, xMax])
    .range([0, width])

  const countryBars = sortedCountries.map((country, countryIndex) => {
    const width = xScale(country[mpiKey])

    let runningX = 0
    let opacity = 1
    if (countSelectedCountries > 0) {
      const selectedCountry = selectedCountries.includes(country.Country)
      opacity = selectedCountry ? 1 : 0.2
    }
    const metricBars = metrics.map(metric => {
      const x = runningX
      const metricPercentage = country[metric]
      const rectWidth = width * (metricPercentage / 100)
      runningX += rectWidth
      return (
        <rect
          key={metric}
          width={rectWidth}
          height={barHeight}
          x={x}
          fill={mpiColors[metric]}
        />
      )
    })
    const y = countryIndex * rowHeight

    return <g opacity={opacity} key={country.ISO3} transform={`translate(0, ${y})`}>
      {/* <rect x={0}
        width={width} height={barHeight}
        fill={'black'}
      /> */}
      {metricBars}
    </g>
  })
  console.log(sortedCountries)
  return (
    <div className='Graph'>
      <div>
        {countryDropdowns}
      </div>
      <div>
        <svg fontSize='0.6em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight} onContextMenu={saveSVG}>

          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <g>{countryBars}</g>
          </g>
        </svg>
      </div>
    </div>
  )
}
