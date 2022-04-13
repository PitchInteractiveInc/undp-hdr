import { Link } from 'react-router-dom';
import './CountryIndexGraph.scss'
import { useState } from 'react'

import ScatterGraph from './ScatterGraph'
import BarGraph from './BarGraph'
import DifferenceGraph from './DifferenceGraph'
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
function GraphWrapper(props) {
  const { graph, data } = props
  const { type, countSelectable } = graph
  const [selectedCountries, setSelectedCountries] = useState(Array.from({length: countSelectable}).map(() => ''))
  const countries = data.filter(d => d.ISO3 !== '')
  let countrySelectors = null
  if (countSelectable > 0) {
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
  return (
    <div className='indexGraph'>
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