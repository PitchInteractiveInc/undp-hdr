import { Link } from 'react-router-dom';
import './CountryIndexGraph.scss'
import { useState, useEffect, useMemo } from 'react'

import ScatterGraph from './ScatterGraph'
import BarGraph from './BarGraph'
import DifferenceGraph from './DifferenceGraph'
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import HDIIntroGraph from './HDIIntroGraph';
import getCountryIndexDescription from './getCountryIndexDescription';
import classNames from 'classnames';
const countSelectable = 3
function GraphWrapper(props) {
  const { graph, data, country, index, syncCountries, forceSelection, indexIndex, printing } = props
  const { type, title, noCountrySelection, pageBreakAfter } = graph
  const [selectedCountries, setSelectedCountries] = useState(Array.from({length: countSelectable}).map(() => ''))
  const [countriesThatFailedToSync, setCountriesThatFailedToSync] = useState(null)
  const countries = useMemo(() => {
    return data.filter(d => d.ISO3 !== '')}, [data])

  useEffect(() => {
    if (forceSelection && !noCountrySelection) {
      const countriesInThisDataset = forceSelection.filter(iso => {
        const country = countries.find(c => c.ISO3 === iso)
        return !!country
      })
      const countriesNotInThisDataset = forceSelection.filter(iso => {
        const country = countries.find(c => c.ISO3 === iso)
        return !country
      })
      const selectionsDifferent = countriesInThisDataset.some(iso => selectedCountries.indexOf(iso) === -1)
        || selectedCountries.some(iso => countriesInThisDataset.indexOf(iso) === -1)
      if (selectionsDifferent) {
        setSelectedCountries(countriesInThisDataset)
      }
      if (countriesNotInThisDataset.length > 0) {
        setCountriesThatFailedToSync(countriesNotInThisDataset)
      } else {
        setCountriesThatFailedToSync(null)
      }
    }
  }, [forceSelection, countries, noCountrySelection, selectedCountries])

  let countrySelectors = null
  if (countSelectable > 0 && !noCountrySelection) {
    countrySelectors = <ComparisonCountrySelectors
      selectedCountries={selectedCountries}
      exclude={country}
      setSelectedCountries={setSelectedCountries}
      maxSelectable={countSelectable}
      countries={countries}
      colored={true || countSelectable > 1}
      syncCountries={syncCountries}
      countriesThatFailedToSync={countriesThatFailedToSync}
      index={index}
      hideCountText={indexIndex !== 0}
    />
  }
  let graphElement = null
  let graphWidth = printing ? 600 : 700
  let graphHeight = printing ? 360 : 460

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
        {' '}Note: the lower {index.key} values represent a better performance regarding{' '}
        {index.key === 'MPI' ? 'multidimensional poverty' :
          index.key === 'GII' ? 'gender inequality' :
          index.key
        }.
      </div>
    )
  }
  let missingCountryDisclaimer = null
  let missingCountries = []
  const potentialCountries = Array.from(new Set([country, ...selectedCountries.filter(d => d !== '').map(iso => data.find(d => d.ISO3 === iso))]))
  potentialCountries.forEach(c => {
    if (!data.find(d => d.ISO3 === c.ISO3)) {
      missingCountries.push(c)
    } else {
      const columns = getGraphColumnsForKey(data, index.key)
      const numValues = columns.reduce((p, col) => {
        return p + (c[col] !== '' ? 1 : 0)
      }, 0)
      if (numValues === 0) {
        missingCountries.push(c)
      }
    }
  })
  if (missingCountries.length) {
    // join with comma and ampresand for last item only
    const countryList = missingCountries.map(c => c.Country)
    const lastCountry = countryList.pop()
    const joinedCountryList = countryList.join(', ') + (countryList.length ? ' & ' : '') + lastCountry

    missingCountryDisclaimer = <div className='missingCountryDisclaimer'>
      The {index.key} covers {countries.length} {index.key === 'MPI' ? ' developing ' : ''} countries only, and is not computed for {joinedCountryList}.
    </div>
  }


  switch(type) {
    case 'hdiIntro':
      graphElement = <HDIIntroGraph {...props} width={graphWidth} height={graphHeight}  />
      break
    case 'scatter':
      graphElement = <ScatterGraph {...props} selectedCountries={selectedCountries} width={graphWidth} height={graphHeight} missingCountries={missingCountries}/>
      break
    case 'bar':
      graphElement = <BarGraph {...props} selectedCountries={selectedCountries} width={graphWidth} height={graphHeight} missingCountries={missingCountries} />
      break
    case 'difference':
      graphElement = <DifferenceGraph {...props} selectedCountries={selectedCountries} width={graphWidth} height={graphHeight} printing={printing} missingCountries={missingCountries} />
      break
    default:
      graphElement = <div>No graph for {type}</div>
  }

  return (
    <div className={classNames('indexGraph', { pageBreakAfter })}>
      {titleText}
      {missingCountryDisclaimer}
      {countrySelectors}
      {lowerBetter}
      {graphElement}
    </div>
  )
}
export default function CountryIndexGraph(props) {
  const { data, country, index, syncCountries, forceSelection, indexIndex, printing } = props

  const { pageBreakAfter } = index
  let additionalIndexContent = null

  return (
    <div className={classNames('CountryIndexGraph', { pageBreakAfter })}>
      <div className='indexText'>
        <div className='key'>{index.key}</div>
        <div className='name'>{index.name}</div>
        <div className='description'>
          {getCountryIndexDescription(country, index, data)}
        </div>
        <div className='indicatorLink'>
          <Link to={`/indicies/${index.key}`}>More Insights on {index.key}</Link>
        </div>
        {additionalIndexContent}
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
              syncCountries={syncCountries}
              forceSelection={forceSelection}
              indexIndex={indexIndex}
              printing={printing}
            />
          })
        }
      </div>
    </div>
  )
}