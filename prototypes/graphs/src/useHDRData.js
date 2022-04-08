import { useEffect, useState } from 'react'
import { csvParse } from 'd3-dsv'


import metadataFile from './data/HDR201122web_metadata_040822.csv'
import dataFile from './data/HDR2020_040722.csv'

export default function useHDRData() {
  const [data, setData] = useState(null)
  const [metadata, setMetadata] = useState(null)
  useEffect(() => {
    const fetchData = async () => {
      const response0 = await fetch(metadataFile)
      const text0 = await response0.text()
      const parsedMetadata = csvParse(text0)
      setMetadata(parsedMetadata)


      const response = await fetch(dataFile)
      const data = await response.text()
      const parsedData = csvParse(data)
      setData(parsedData)
    }
    fetchData()
  }, [])

  return { data, metadata }

}
