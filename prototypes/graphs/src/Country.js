import { useParams } from "react-router-dom"
import useHDRData from "./useHDRData"
import './Country.scss'
import indicators from './indicators'
import CountryIndexGraph from './CountryIndexGraph'
import useMPIData from "./useMPIData"
import { useEffect, useState, useCallback } from "react"
import getGraphColumnsForKey from "./getGraphColumnsForKey"
export default function Country(props) {
  let {data} = useHDRData()
  const mpiData = useMPIData()
  const params = useParams()

  const [syncingCountries, setSyncingCountries] = useState(false)
  const syncCountries = useCallback((countries) => {
    setSyncingCountries(countries)
  }, [])


  useEffect(() => {
    if (syncingCountries) {
      setSyncingCountries(false)
    }
  }, [syncingCountries])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

  }, [params.country])
  if (!data || !mpiData) {
    return
  }

  const country = data.find(d => d.ISO3 === params.country)

  const populationColumns = getGraphColumnsForKey(data, 'pop_total')
  const lastPopulationColumn = populationColumns[populationColumns.length - 1]
  const formattedPopulation = (country[lastPopulationColumn] * 1000000).toLocaleString()
  return (
    <div className='CountryDetail'>

      {/* <select value={params.country} onChange={setCountry}>
        {data.map(d => {
          return <option key={d.ISO3} value={d.ISO3}>{d.Country}</option>
        })}
      </select> */}
      <div className='dataUpdated'>Data updates as of DD.MM.YYYY</div>
      <div className='countryNameAndFlag'>
        <img key={country.ISO3} src={`${process.env.PUBLIC_URL}/flags/${country.ISO3}.GIF`} alt={`${country.Country} flag`} />
        <div className='countryName'>{country.Country}</div>
      </div>
      <div className='population'>Population {formattedPopulation}</div>
      <div className='downloadLinks'>
        <span className='downloadLabel'>Download</span>
        <a href="#">Country Data (csv)</a>
        <a href="#">Metadata (PDF)</a>
        <a href="#">Print this page</a>

      </div>
      <div className='countryIntro'>
        Human development summary capturing achievements in the HDI and complementary metrics that estimate gender gaps, inequality, planetary pressures and poverty.      </div>
      <div className='indicies'>
        {indicators.map((indicator, i) => {
          let dataToUse = indicator.key === 'MPI' ? mpiData : data
          const countryToUse = dataToUse.find(d => d.ISO3 === params.country) || country
          return <CountryIndexGraph
            key={indicator.key}
            index={indicator}
            data={dataToUse}
            country={countryToUse}
            syncCountries={syncCountries}
            forceSelection={syncingCountries}
            indexIndex={i}
          />
        })}
      </div>

      <div className='footnote'>
        <sup>1</sup> It is important to note that HDRO is mandated to use internationally-standardized data. National and international data can differ because international agencies standardize national data to allow comparability across countries and, in some cases, may not have access to the most recent national data.
      </div>
    </div>
  )
}
