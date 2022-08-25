import { useEffect, useState } from 'react'
import { csvParse } from 'd3-dsv'


import metadataFile from './data/HDR201122web_metadata_040822.csv'
import dataFile from './data/Onlinemaster_HDR2122_081522.csv'

const countriesToRemove = [
  'MCO', 'PRK', 'SOM', 'NRU',
]
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
      const filtered = parsedData.filter(country => {
        return !countriesToRemove.includes(country.ISO3)
      })
      filtered.columns = parsedData.columns
      setData(filtered)
    }
    fetchData()
  }, [])

  return { data, metadata }

}
