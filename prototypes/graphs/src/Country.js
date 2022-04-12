import { useNavigate, useParams } from "react-router-dom"
import useHDRData from "./useHDRData"
import './Country.scss'
import indicators from './indicators'
export default function Country(props) {
  const {data, metadata} = useHDRData()
  const params = useParams()
  const navgiate = useNavigate()
  if (!data) {
    return
  }
  const country = data.find(d => d.ISO3 === params.country)
  const setCountry = (country) => {
    navgiate(`/countries/${country}`, {replace: true})
  }
  return (
    <div className='CountryDetail'>
      {/* <select value={params.country} onChange={setCountry}>
        {data.map(d => {
          return <option key={d.ISO3} value={d.ISO3}>{d.Country}</option>
        })}
      </select> */}
      <div className='dataUpdated'>Data updates as of DD.MM.YYYY</div>
      <div className='countryNameAndFlag'>
        <div className='countryName'>{country.Country}</div>
      </div>
      <div className='countryIntro'>
        Lorem ipsum...
      </div>
      <div className='downloadLinks'>
        Download
        <a href="#">Country Data (csv)</a>
        <a href="#">Metadata (PDF)</a>
        <a href="#">This page as PDF</a>

      </div>

    </div>
  )
}
