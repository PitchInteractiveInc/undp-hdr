import { Link } from 'react-router-dom';
import './CountryIndexGraph.scss'
import { useState } from 'react'

import ScatterGraph from './ScatterGraph'
import BarGraph from './BarGraph'
import DifferenceGraph from './DifferenceGraph'
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import HDIIntroGraph from './HDIIntroGraph';
const countSelectable = 3
function GraphWrapper(props) {
  const { graph, data, country, index } = props
  const { type, title, noCountrySelection} = graph
  const [selectedCountries, setSelectedCountries] = useState(Array.from({length: countSelectable}).map(() => ''))
  const countries = data.filter(d => d.ISO3 !== '')
  let countrySelectors = null
  if (countSelectable > 0 && !noCountrySelection) {
    countrySelectors = <ComparisonCountrySelectors
      selectedCountries={selectedCountries}
      setSelectedCountries={setSelectedCountries}
      maxSelectable={countSelectable}
      countries={countries}
      colored={true || countSelectable > 1}
    />
  }
  let graphElement = null
  switch(type) {
    case 'hdiIntro':
      graphElement = <HDIIntroGraph {...props} />
      break
    case 'scatter':
      graphElement = <ScatterGraph {...props} selectedCountries={selectedCountries} />
      break
    case 'bar':
      graphElement = <BarGraph {...props} selectedCountries={selectedCountries} />
      break
    case 'difference':
      graphElement = <DifferenceGraph {...props} selectedCountries={selectedCountries} />
      break
    default:
      graphElement = <div>No graph for {type}</div>
  }
  let titleText = null
  if (title) {
    const columns = getGraphColumnsForKey(data, index.key)
    const yearExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
    columns.forEach(col => {
      const year = +col.substr(col.lastIndexOf('_') + 1)
      yearExtent[0] = Math.min(yearExtent[0], year)
      yearExtent[1] = Math.max(yearExtent[1], year)
    })
    titleText = <div className='graphTitle'>{title({country: country.Country, extent: yearExtent})}</div>
  }
  let lowerBetter = null
  if (index.lowerBetter) {
    lowerBetter = (
      <div className='lowerBetter'>
        Note: the lower {index.key} value the country has, the better rank it is in {index.key}.
      </div>
    )
  }
  let missingCountryDisclaimer = null
  if (!data.includes(country)) {
    missingCountryDisclaimer = <div className='missingCountryDisclaimer'>
      <strong>{country.Country} is not a part of the {index.key} graph below.</strong><br />
      Due to a lack of relavant data, the {index.key} has not been calculated for this country.
    </div>
  }
  return (
    <div className='indexGraph'>
      {titleText}
      {lowerBetter}
      {missingCountryDisclaimer}
      {countrySelectors}
      {graphElement}
    </div>
  )
}
export default function CountryIndexGraph(props) {
  const { data, country, index } = props

  return (
    <div className='CountryIndexGraph'>
      <div className='indexText'>
        <div className='key'>{index.key}</div>
        <div className='name'>{index.name}</div>
        <div className='description'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc hendrerit ligula sit amet tortor auctor semper. Aliquam aliquet, augue non consectetur congue, eros enim tempor ipsum, ac fringilla odio tellus a sapien. Integer maximus sem id justo consectetur, vitae porttitor est efficitur.
        </div>
        <div className='indicatorLink'>
          <Link to={`/indicies/${index.key}`}>More Insights on {index.key}</Link>
        </div>
      </div>
      <div className='indexGraphs'>
        {
          index.countryGraphs.map((graph) => {
            return <GraphWrapper
              key={graph.type}
              data={data}
              country={country}
              index={index}
              graph={graph}
            />
          })
        }
      </div>
    </div>
  )
}