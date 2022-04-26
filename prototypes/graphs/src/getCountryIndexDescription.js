import getGraphColumnsForKey from "./getGraphColumnsForKey"
import getYearOfColumn from "./getYearOfColumn"
import format from "./format"

let defaultDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc hendrerit ligula sit amet tortor auctor semper. Aliquam aliquet, augue non consectetur congue, eros enim tempor ipsum, ac fringilla odio tellus a sapien. Integer maximus sem id justo consectetur, vitae porttitor est efficitur.'

function getCountryWithApostrophe(country) {
  return `${country}'s`
}

export default function getCountryIndexDescription(country, index, data) {
  let description = null

  const indexColumns = getGraphColumnsForKey(data, index.key, data)
  const columnsReversed = indexColumns.slice().reverse()
  const lastColumnWithData = columnsReversed.find(col => {
    return country[col] !== ''
  })
  const latestYear = getYearOfColumn(lastColumnWithData)
  const latestValue = country[lastColumnWithData]
  const latestValueFormatted = format(latestValue, index.key)
  const firstColumnWithData = indexColumns.find(col => {
    return country[col] !== ''
  })
  const firstYear = getYearOfColumn(firstColumnWithData)
  const firstValue = country[firstColumnWithData]
  const firstValueFormatted = format(firstValue, index.key)
  const percentChange = (latestValue - firstValue) / firstValue * 100
  const percentChangeFormatted = percentChange.toFixed(1)
  if (index.key === 'HDI') {
    const leIncrease = format(country[`le_${latestYear}`] - country[`le_${firstYear}`], 'le')
    const mysIncrease = format(country[`mys_${latestYear}`] - country[`mys_${firstYear}`], 'mys')
    const eysIncrease = format(country[`eys_${latestYear}`] - country[`eys_${firstYear}`], 'eys')
    const gnipcPercentIncreaseIncrease = ((country[`gnipc_${latestYear}`] - country[`gnipc_${firstYear}`]) / country[`gnipc_${firstYear}`] * 100).toFixed(1)
    description = (
      <>
        <p>
          The HDI is a summary measure for assessing long-term progress in three basic dimensions of human development: a long and healthy life, access to knowledge and a decent standard of living. {getCountryWithApostrophe(country.Country)} HDI value for {latestYear} is {latestValueFormatted}— which put the country in the {country.hdicode} human development category—positioning it at {country[`hdi_rank_${latestYear}`]} out of {data.length} countries and territories.
        </p>
        <p>
          Between {firstYear} and {latestYear}, {getCountryWithApostrophe(country.Country)} HDI value increased from {firstValueFormatted} to {latestValueFormatted}, an increase of {percentChangeFormatted} percent.
        </p>
        <p>
          Between {firstYear} and {latestYear}, {getCountryWithApostrophe(country.Country)} life expectancy at birth increased by {leIncrease} years, mean years of schooling increased by {mysIncrease} years and expected years of schooling increased by {eysIncrease} years. {getCountryWithApostrophe(country.Country)} GNI per capita increased by about {gnipcPercentIncreaseIncrease} percent between {firstYear} and {latestYear}.
        </p>
      </>
    )
  }

  return description || defaultDescription
}
