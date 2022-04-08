import { useParams } from "react-router-dom"
import useHDRData from "./useHDRData"

export default function Country(props) {
  const {data, metadata} = useHDRData()
  const params = useParams()

  return (
    <div>eh{JSON.stringify(params)}</div>
  )
}
