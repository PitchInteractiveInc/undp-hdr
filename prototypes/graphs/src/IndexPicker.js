import useHDRData from "./useHDRData"
import { useParams, useNavigate, Outlet } from "react-router-dom"
import { useState } from 'react'
export default function IndexPicker(props) {
  const {data, metadata} = useHDRData()
  const defaultMetricIndex = 6
  const [showAllMetrics, setShowAllMetrics] = useState(false)

  const params = useParams()
  const navigate = useNavigate()
  console.log(params)

  const setIndex = (indexIndex) => {
    navigate(`/indicies/${indexIndex}`, {replace: true})
  }
  if (!data) {
    return null
  }
  const countries = data.filter(d => d.ISO3 !== '')
  console.log(countries)
  return (
    <div>
      <div>
        <select value={params.selectedMetricIndex || defaultMetricIndex} onChange={e => setIndex(e.target.value)}>
          {metadata.map((d, i) => {
            if (!d['Full name'].includes('Index') && !showAllMetrics) {
              return null
            }
            return <option key={i} value={i}>{d['Full name']}</option>
          })}
        </select>

        <span>
          Show all Metrics?{' '}
          <input type="checkbox" checked={showAllMetrics} onChange={e => setShowAllMetrics(e.target.checked)} />
        </span>
      </div>

      <Outlet data={data} {...params} />
    </div>
  )
}
