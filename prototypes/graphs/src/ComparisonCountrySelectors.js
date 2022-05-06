import { range } from 'd3-array'
import './ComparisonCountrySelectors.scss'
import classNames from 'classnames'
import xIcon from './images/x.svg'
import { useEffect, useState } from 'react'
import syncButton from './images/syncButton.svg'
import failedSync from './images/failedSync.svg'
export const comparisonColors = [
  '#813BC7', '#ED9B25', '#00B786'
]

export default function ComparisonCountrySelectors(props) {
  const { selectedCountries,
    countries,
    setSelectedCountries,
    colored,
    maxSelectable,
    exclude,
    syncCountries,
    hideSync,
    colorByIndexValue,
    indexData,
    graphColumns,
    colorScale,
    countriesThatFailedToSync,
    index,
    hideCountText,
  } = props
  const numToShow = Math.min(maxSelectable, selectedCountries.filter(d => d !== '').length + 1)
  useEffect(() => {
    setSelectedCountries(Array.from({length: maxSelectable}).map(() => ''))
  }, [exclude, maxSelectable, setSelectedCountries])

  const [syncing, setSyncing] = useState( false )
  const [synced, setSynced] = useState(false)
  const sync = () => {
    setSyncing( true )
    let id = setTimeout( () => {
      setSyncing( false )
      setSynced( true )
      id = setTimeout(() => {
        setSynced( false )
      }, 3000)
    }, 1600)
    syncCountries(selectedCountries)
    return () => clearTimeout( id )
  }

  let countText = hideCountText ? null : ` (Up to ${maxSelectable})`

  return <div className='ComparisonCountrySelectors'>
    <div className='countryComparisonSelectorLabel'>Add Country To Compare{countText}
      {hideSync ? null :
        <div className={classNames('syncButton', { syncing, synced })} onClick={sync}
          >
          <img src={countriesThatFailedToSync ? failedSync : syncButton} alt='' />
          {syncing ? 'Syncing...' :
            synced ? 'Countries Synced' :
            'Sync'
          }
          <div className='tip'>{countriesThatFailedToSync ?
            `Some countries do not have data for ${index.key} and did not sync` : 'Click To Sync Country Selection'}</div>
        </div>
      }
    </div>
    <div className='selects'>
      {range(numToShow).map(i => {
        const value = selectedCountries[i] || ''
        const setCountry = (iso) => {
          let newSelectedCountries = [...selectedCountries]
          newSelectedCountries[i] = iso
          newSelectedCountries = newSelectedCountries.filter(d => d !== '')
          setSelectedCountries(newSelectedCountries)
        }
        const hasSelection = value !== ''
        const color = colored ? comparisonColors[i] : null
        const style = {}
        if (hasSelection) {
          style.backgroundColor = color
          style.color = colored ? 'white' : null
          if (colorByIndexValue) {
            let colored = false
            if (indexData) {
              const countryDatum = indexData.find(d => d.ISO3 === value)
              if (countryDatum) {
                const firstColumnWithData = graphColumns.find(d => countryDatum[d] !== '')
                if (firstColumnWithData) {
                  style.backgroundColor = colorScale(countryDatum[firstColumnWithData])
                  style.color = '#fff'
                  colored = true
                }
              }
            }
            if (!colored) {
              style.backgroundColor = '#000'
              style.color = '#fff'
            }
          }
        }

        const countriesSorted = [...countries].sort((a, b) => a.Country.localeCompare(b.Country))
        const placeholder = 'Add a country'.toUpperCase()
        return <span key={i}>
          <select placeholder={placeholder} style={style} value={value} className={classNames({noSelection: !hasSelection})} onChange={e => setCountry(e.target.value)}>
            <option value=''>{placeholder}</option>
            {countriesSorted.map(country => {
              let disabled = false
              if (selectedCountries.includes(country.ISO3)) {
                disabled = true
              }
              if (exclude && exclude.ISO3 === country.ISO3) {
                disabled = true
              }

              return <option disabled={disabled} key={country.ISO3} value={country.ISO3}>{country.Country}</option>
            })}
          </select>
          {hasSelection ? (
            <img src={xIcon} alt='deselect country' onClick={() => setCountry('')} />
          ) : null}
        </span>

      })}
    </div>
  </div>


}
