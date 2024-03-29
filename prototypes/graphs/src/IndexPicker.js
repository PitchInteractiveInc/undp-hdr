import useHDRData from "./useHDRData"
import { useParams, useNavigate, Outlet } from "react-router-dom"
import indicators from './indicators'
import './IndexPicker.scss'
export default function IndexPicker(props) {
  const {data } = useHDRData()

  const params = useParams()
  const navigate = useNavigate()

  const setIndex = (key) => {
    navigate(`/indicies/${key}`, {replace: true})
  }
  if (!data) {
    return null
  }
  const countries = data.filter(d => d.ISO3 !== '')
  return (
    <div className='IndexPicker'>
      <div className='indexPickerNav'>
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
