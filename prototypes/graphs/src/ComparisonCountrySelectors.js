import { range } from 'd3-array'
import './ComparisonCountrySelectors.scss'
import classNames from 'classnames'
import xIcon from './images/x.svg'
export const comparisonColors = [
  '#813BC7', '#ED9B25', '#00B786'
]
export default function ComparisonCountrySelectors(props) {
  const { selectedCountries, countries, setSelectedCountries, colored, maxSelectable, exclude } = props
  const numToShow = Math.min(maxSelectable, selectedCountries.filter(d => d !== '').length + 1)
  return <div className='ComparisonCountrySelectors'>
    <div className='label'>Add Country To Compare</div>
    {range(numToShow).map(i => {
      const value = selectedCountries[i] || ''
      const setCountry = (iso) => {
        let newSelectedCountries = [...selectedCountries]
        newSelectedCountries[i] = iso
        newSelectedCountries = newSelectedCountries.filter(d => d !== '')
        console.log(newSelectedCountries)
        setSelectedCountries(newSelectedCountries)
      }
      const hasSelection = value !== ''
      const color = colored ? comparisonColors[i] : null
      const style = {}
      if (hasSelection) {
        style.backgroundColor = color
        style.color = colored ? 'white' : null
      }
      const countriesSorted = [...countries].sort((a, b) => a.Country.localeCompare(b.Country))
      const placeholder = 'Add a country'.toUpperCase()

      return <span key={i}>
        <select placeholder={placeholder} style={style} value={value} className={classNames({noSelection: !hasSelection})} onChange={e => setCountry(e.target.value)}>
          <option value=''>{placeholder}</option>
          {countriesSorted.map(country => {
            if (exclude && exclude.ISO3 === country.ISO3) {
              return null
            }
            return <option key={country.ISO3} value={country.ISO3}>{country.Country}</option>
          })}
        </select>
        {hasSelection ? (
          <img src={xIcon} alt='deselect country' onClick={() => setCountry('')} />
        ) : null}
      </span>

    })}
  </div>


}
