import { Link } from 'react-router-dom';
import './CountryIndexGraph.scss'
import { useState } from 'react'

import ScatterGraph from './ScatterGraph'
import BarGraph from './BarGraph'
import DifferenceGraph from './DifferenceGraph'
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
function GraphWrapper(props) {
  const { selectableCountries, graphType, data } = props
  const [selectedCountries, setSelectedCountries] = useState(Array.from({length: selectableCountries}).map(() => ''))
  const countries = data.filter(d => d.ISO3 !== '')
  let countrySelectors = null
  if (selectableCountries > 0) {
    countrySelectors = <ComparisonCountrySelectors
      selectedCountries={selectedCountries}
      setSelectedCountries={setSelectedCountries}
      maxSelectable={selectableCountries}
      countries={countries}
      colored={true || selectableCountries > 1}
    />
  }
  let graph = null
  switch(graphType) {
    case 'scatter':
      graph = <ScatterGraph {...props} />
      break
    case 'bar':
      graph = <BarGraph {...props}  />
      break
    case 'difference':
      graph = <DifferenceGraph {...props}  />
      break
    default:
      graph = <div>No graph for {graphType}</div>
  }
  return (
    <div className='indexGraph'>
      {countrySelectors}
      {graph}
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
          index.countryGraphTypes.map((graphType, i) => {
            return <GraphWrapper
              key={graphType}
              data={data}
              country={country}
              index={index}
              graphType={graphType}
              selectableCountries={index.countryGraphComparisonSelectableCountries[i]}
            />
          })
        }
      </div>
    </div>
  )
}