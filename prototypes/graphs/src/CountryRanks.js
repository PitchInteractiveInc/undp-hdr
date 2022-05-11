import useHDRData from "./useHDRData"
import { Link, Navigate, useNavigate } from "react-router-dom"
import './CountryRanks.scss'
import { useEffect, useState } from "react"
import Dropdown from "./Dropdown"
import RegionFilter from "./RegionFilter"
import getGraphColumnsForKey from "./getGraphColumnsForKey"
import getYearOfColumn from "./getYearOfColumn"
import format from "./format"
import classNames from "classnames"
import { useWindowSize } from "react-use"
const sortOptions = [
  { id: 'a-z', name: 'A-Z' },
  { id: 'rank', name: 'Rank' },
]
const tableColumns = [
  { label: 'Rank', value: (country, year) => country[`hdi_rank_${year}`] },
  { label: 'Country', value: (country) => (
    <div className='countryNameAndFlag'>
      <img className='flag' src={`${process.env.PUBLIC_URL}/flags/${country.ISO3}.GIF`} alt={`flag`} />
      <span style={{ fontWeight: 'normal' }}>{country.Country}</span>
   </div>)
  },
  { label: 'HDI Value',
    value: (country, year) => {
      const value = country[`hdi_${year}`]
      return value
    }
  },
  {
    label: (year) => `Change from ${year - 1}`,
    value: (country, year) => {
      const yearValue = country[`hdi_${year}`]
      const yearValuePrev = country[`hdi_${year - 1}`]
      const diff = yearValue - yearValuePrev

      const className = diff >= 0 ? 'positive' : 'negative'
      return (
        <div className='diffAndLink'>
          <span className={className}>
            <svg className='changeArrow' xmlns="http://www.w3.org/2000/svg" width="11.954" height="5.977" viewBox="0 0 11.954 5.977">
              <path id="Polygon_1061" data-name="Polygon 1061" d="M5.977,0l5.977,5.977H0Z" />
            </svg>

            {format(diff, 'HDI') }
          </span>
          <Link to={`/countries/${country.ISO3}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="8.714" height="12.119" viewBox="0 0 8.714 12.119">
              <path id="Path_32762" data-name="Path 32762" d="M14781.4,13958l5.284,6.5,5.284-6.5" transform="translate(-13957.369 14792.741) rotate(-90)" fill="none" stroke="#eb3828" strokeWidth="2"/>
            </svg>
          </Link>
        </div>
      )
    }
  },
]

function Table(props) {
  const { data, selectedRegion, sort, selectedCountry } = props
  const graphColumns = getGraphColumnsForKey(data, 'HDI')
  const lastColumn = graphColumns[graphColumns.length - 1]
  const columnYear = getYearOfColumn(lastColumn)
  const columnWidth = 510
  const windowSize = useWindowSize()
  const twoColumnLayout = windowSize.width >= columnWidth * 2
  const sorted = data.filter(d => d.ISO3 !== '')
    .filter(country => selectedRegion === '' || country.region === selectedRegion)
  sorted.sort((a, b) => {
    if (sort === 'a-z') {
      return a.Country.localeCompare(b.Country)
    }
    if (sort === 'rank') {
      return a[`hdi_rank_${columnYear}`] - b[`hdi_rank_${columnYear}`]
    }
    return 0
  })
  const tables = []
  if (twoColumnLayout) {
    const firstColumnData = sorted.filter((d, i) => i % 2 === 0)
    const secondColumnData = sorted.filter((d, i) => i % 2 === 1)
    tables.push(firstColumnData, secondColumnData)
  } else {
    tables.push(sorted)
  }

  useEffect(() => {
    if (selectedCountry !== '') {
      const element = document.querySelector(`.rankRow${selectedCountry}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedCountry])

  const navigate = useNavigate()
  const clickCountry = (iso3) => () => {
    navigate(`/countries/${iso3}`, { replace: true })
  }

  return (
    <div className='Table'>
      {tables.map((tableData, i) => {
        return (
          <table key={i}>
            <thead>
              <tr>
                {tableColumns.map(({ label }, i) => <th key={i}>{label instanceof Function ? label(columnYear) : label}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableData.map((country, i) => {
                const nextSelected = tableData[i + 1] ? tableData[i + 1].ISO3 === selectedCountry : false
                const countryClassName = `rankRow${country.ISO3}`
                return (
                  <tr
                    key={country.ISO3}
                    className={classNames(countryClassName, { selected: country.ISO3 === selectedCountry, nextSelected})}
                    onClick={clickCountry(country.ISO3)}
                  >
                    {tableColumns.map(({ value }, i) => {
                      return <td key={i}>{value(country, columnYear)}</td>
                    })}
                  </tr>

                )
              })}
            </tbody>
          </table>
        )
      })}
    </div>
  )
}
export default function CountryRanks(props) {
  const {data} = useHDRData()
  const [selectedRegion, setSelectedRegion] = useState('')
  const [sort, setSort] = useState('a-z')
  const [selectedCountry, setSelectedCountry] = useState('')
  let table = data ? <Table data={data} sort={sort} selectedRegion={selectedRegion} selectedCountry={selectedCountry} /> : null
  let year = 2020
  let countries = []
  if (data) {
    const graphColumns = getGraphColumnsForKey(data, 'HDI')
    const lastColumn = graphColumns[graphColumns.length - 1]
    year = getYearOfColumn(lastColumn)
    countries = data.filter(d => d.ISO3 !== '')
  }
  return (
    <div className='CountryRanks'>
      <h2>{year} Global Human Development Index</h2>
      <div className='description'>Explore human development data from around the world. The list of countries shows only the United Nations member states with the available HDI values</div>
      <div className='controls'>
        <Dropdown
          label='Sort List'
          values={sortOptions}
          selected={sort}
          setSelected={setSort}
        />
        <Dropdown
          label='Find a country in the list'
          values={countries}
          selected={selectedCountry}
          setSelected={setSelectedCountry}
          defaultLabel={'Select to find the country'}
          valueAccessor={d => d.ISO3}
          labelAccessor={d => d.Country}
        />
        <RegionFilter
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
      </div>
      {table}
    </div>
  )
}
