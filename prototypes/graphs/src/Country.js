import { useParams } from "react-router-dom"
import useHDRData from "./useHDRData"
import './Country.scss'
import indicators from './indicators'
import CountryIndexGraph from './CountryIndexGraph'
import useMPIData from "./useMPIData"
import { useEffect, useState, useCallback } from "react"
import getGraphColumnsForKey from "./getGraphColumnsForKey"
import useDetectPrint from "./useDetectPrint"
import { csvFormat } from "d3-dsv"
import {useWindowSize} from 'react-use';
import classNames from "classnames"
import formatCSV from './data/metricCSVRenames.js'
export default function Country(props) {
  let {data} = useHDRData()
  const mpiData = useMPIData()
  const params = useParams()

  const [syncingCountries, setSyncingCountries] = useState(false)
  const syncCountries = useCallback((countries) => {
    setSyncingCountries(countries)
  }, [])

  const windowSize = useWindowSize()
  const maxBlockSize = 1392
  const windowWidth = Math.min(maxBlockSize, windowSize.width) - 32 - 20
  const singleColumnLayout = windowWidth <= 700
  const maxGraphWidth = maxBlockSize * 0.7 - 64;
  const measuredGraphWidth = windowWidth * 0.7 - 64;
  const potentialMultiColumnGraphWidth = Math.min(maxGraphWidth, measuredGraphWidth)
  const graphWidth = singleColumnLayout ?  windowWidth : potentialMultiColumnGraphWidth

  useEffect(() => {
    if (syncingCountries) {
      setSyncingCountries(false)
    }
  }, [syncingCountries])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

  }, [params.country])

  const printing = useDetectPrint()
  const [printingViaButton, setPrintingViaButton] = useState(false)
  if (!data || !mpiData) {
    return
  }

  const country = data.find(d => d.ISO3 === params.country)
  const populationColumns = getGraphColumnsForKey(data, 'pop_total')
  const lastPopulationColumn = populationColumns[populationColumns.length - 1]
  const formattedPopulation = (country[lastPopulationColumn] * 1000000).toLocaleString()
  const print = () => {
    setPrintingViaButton(true)
    setTimeout(() => {
      window.print()
      setPrintingViaButton(false)

    }, 100)
  }

  const download = () => {
    const merged = { ...country}

    const mpiCountry = mpiData.find(d => d.Country === country.Country)
    if (mpiCountry) {
      Object.keys(mpiCountry).forEach(key => {
        merged[key] = mpiCountry[key]
      })
    }
    const csv = formatCSV(merged)
    // console.log(csv)
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = window.URL.createObjectURL(
      new Blob([csv], { type: "text/csv" })
    );
    a.setAttribute("download", `${country.Country}.csv`);
    a.click();

    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);

  }
  return (
    <div className={ classNames('CountryDetail', { singleColumnLayout })}>

      {/* <select value={params.country} onChange={setCountry}>
        {data.map(d => {
          return <option key={d.ISO3} value={d.ISO3}>{d.Country}</option>
        })}
      </select> */}
      <div className='dataUpdated'>Data updates as of December 15th, 2020</div>
      <div className='countryNameAndFlag'>
        <img key={country.ISO3} src={`${process.env.PUBLIC_URL}/flags/${country.ISO3}.GIF`} alt={`${country.Country} flag`} />
        <div className='countryName'>{country.Country}</div>
      </div>
      <div className='population'>Population {formattedPopulation}</div>
      <div className='downloadLinks'>
        <span className='downloadLabel'>Download</span>
        <button onClick={download}>Country Data (csv)</button>
        <a href="/data-center/documentation-and-downloads">Metadata</a>
        <button onClick={print}>Print this page</button>

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
            printing={printing || printingViaButton}
            graphWidth={graphWidth}
          />
        })}
      </div>

      <div className='footnote'>
        <sup>1</sup> It is important to note that HDRO is mandated to use internationally-standardized data. National and international data can differ because international agencies standardize national data to allow comparability across countries and, in some cases, may not have access to the most recent national data.
      </div>
    </div>
  )
}
