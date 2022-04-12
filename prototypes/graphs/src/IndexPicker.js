import useHDRData from "./useHDRData"
import { useParams, useNavigate, Outlet } from "react-router-dom"
import { useState } from 'react'
import indicators from './indicators'
export default function IndexPicker(props) {
  const {data, metadata} = useHDRData()
  const defaultMetricIndex = 6
  const [showAllMetrics, setShowAllMetrics] = useState(false)

  const params = useParams()
  const navigate = useNavigate()
  console.log(params)

  const setIndex = (key) => {
    navigate(`/indicies/${key}`, {replace: true})
  }
  if (!data) {
    return null
  }
  const countries = data.filter(d => d.ISO3 !== '')
  console.log(countries)
  return (
    <div>
      <div>
        <select value={params.selectedMetricShortName } onChange={e => setIndex(e.target.value)}>
          <option value="">Select an index</option>
          {indicators.map((d, i) => {

            return <option key={i} value={d['key']}>{d['name']}</option>
          })}
        </select>

      </div>

      <Outlet data={data} {...params} />
    </div>
  )
}
