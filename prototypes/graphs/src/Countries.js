import useHDRData from "./useHDRData"
import { useParams, useNavigate, Outlet } from "react-router-dom"
import './Countries.scss'
export default function Countries(props) {
  const {data} = useHDRData()
  const params = useParams()
  const navigate = useNavigate()
  console.log(params)

  const setCountry = (country) => {
    navigate(`/countries/${country}`, {replace: true})
  }
  if (!data) {
    return null
  }
  const countries = data.filter(d => d.ISO3 !== '')
  countries.sort((a, b) => a.Country.localeCompare(b.Country))
  return (
    <div className='Countries'>
      <div>
        <select className='countrySelect' placeholder='Select a country' value={params.country || ''} onChange={e => setCountry(e.target.value)}>
          <option value=''>Select a country</option>
          {countries.map(country => {
            return <option key={country.ISO3} value={country.ISO3}>{country.Country}</option>
          })}
        </select>
      </div>
      <Outlet data={data} {...params} />
    </div>
  )
}
