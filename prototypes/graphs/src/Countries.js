import useHDRData from "./useHDRData"
import { useParams, useNavigate, Outlet } from "react-router-dom"
export default function Countries(props) {
  const {data, metadata} = useHDRData()
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
  console.log(countries)
  return (
    <div>
      <div>
        <select placeholder='Select a country' value={params.country || ''} onChange={e => setCountry(e.target.value)}>
          <option value=''>Select a country</option>
          {countries.map(country => {
            return <option key={country.ISO3} value={country.ISO3}>{country.Country}</option>
          })}
        </select>
      </div>
      {JSON.stringify(props)}
      <Outlet data={data} {...params} />
    </div>
  )
}
