import { useParams } from "react-router-dom"
import useHDRData from "./useHDRData"
import './Country.scss'
import indicators from './indicators'
import CountryIndexGraph from './CountryIndexGraph'
export default function Country(props) {
  const {data} = useHDRData()
  const params = useParams()
  if (!data) {
    return
  }
  const country = data.find(d => d.ISO3 === params.country)
  return (
    <div className='CountryDetail'>
      {/* <select value={params.country} onChange={setCountry}>
        {data.map(d => {
          return <option key={d.ISO3} value={d.ISO3}>{d.Country}</option>
        })}
      </select> */}
      <div className='dataUpdated'>Data updates as of DD.MM.YYYY</div>
      <div className='countryNameAndFlag'>
        <img src={`${process.env.PUBLIC_URL}/flags/${country.ISO3}.GIF`} alt={`${country.Country} flag`} />
        <div className='countryName'>{country.Country}</div>
      </div>
      <div className='population'>Population ##,###,###</div>
      <div className='countryIntro'>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc hendrerit ligula sit amet tortor auctor semper. Aliquam aliquet, augue non consectetur congue, eros enim tempor ipsum, ac fringilla odio tellus a sapien. Integer maximus sem id justo consectetur, vitae porttitor est efficitur.
      </div>
      <div className='downloadLinks'>
        Download
        <a href="#">Country Data (csv)</a>
        <a href="#">Metadata (PDF)</a>
        <a href="#">This page as PDF</a>

      </div>
      <div className='indicies'>
        {indicators.map((indicator, i) => {
          return <CountryIndexGraph key={indicator.key} index={indicator} data={data} country={country} />
        })}
      </div>

    </div>
  )
}
