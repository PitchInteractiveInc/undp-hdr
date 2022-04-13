import { range } from 'd3-array'
import './ComparisonCountrySelectors.scss'
import classNames from 'classnames'
import xIcon from './images/x.svg'
const comparisonColors = [
  '#813BC7', '#ED9B25', '#00B786'
]
export default function ComparisonCountrySelectors(props) {
  const { selectedCountries, countries, setSelectedCountries, colored, maxSelectable } = props
  return <div className='ComparisonCountrySelectors'>
    {range(maxSelectable).map(i => {
    const value = selectedCountries[i] || ''
    const setCountry = (iso) => {
      const newSelectedCountries = [...selectedCountries]
      newSelectedCountries[i] = iso
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

    const placeholder = 'Add a country'.toUpperCase()
    return <span key={i}>
        <select placeholder={placeholder} style={style} value={value} className={classNames({noSelection: !hasSelection})} onChange={e => setCountry(e.target.value)}>
          <option value=''>{placeholder}</option>
          {countries.map(country => {
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
