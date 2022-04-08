import { useEffect, useState } from 'react'
import { csvParse } from 'd3-dsv'


import mpiFile from './data/MPI_formatted.csv'

export default function useMPIData() {
  const [data, setData] = useState(null)
  useEffect(() => {
    const fetchData = async () => {

      const response = await fetch(mpiFile)
      const data = await response.text()
      const parsedData = csvParse(data)
      setData(parsedData)
    }
    fetchData()
  }, [])

  return data

}
