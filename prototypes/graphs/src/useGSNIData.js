import { useEffect, useState } from 'react'
import { csvParse } from 'd3-dsv'


import gsniFile from './data/GSNI.csv'
import dataFile from './data/HDR2020_040722.csv'

export default function useMPIData() {
  const [data, setData] = useState(null)
  useEffect(() => {
    const fetchData = async () => {

      const response = await fetch(gsniFile)
      const data = await response.text()
      const parsedData = csvParse(data)

      const dataFile2 = await fetch(dataFile)
      const data2 = await dataFile2.text()
      const parsedData2 = csvParse(data2)

      parsedData.forEach(row => {
        const country = row.Country
        const countryData = parsedData2.find(d => d.Country === country)
        if (countryData) {
          row.ISO3 = countryData.ISO3
        }
        const numericKeys = ['Total', 'Men', 'Women', 'Share of people with no bias', 'Political', 'Educational', 'Economic', 'Physical integrity']
        numericKeys.forEach(key => {
          row[key] = +row[key]
        })


      })


      setData(parsedData)
      //       setData(parsedData.filter(d => d.Country !== 'Overall average'))

    }
    fetchData()
  }, [])

  return data

}
