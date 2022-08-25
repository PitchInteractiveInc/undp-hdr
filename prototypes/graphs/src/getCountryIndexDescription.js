import getGraphColumnsForKey from "./getGraphColumnsForKey"
import getYearOfColumn from "./getYearOfColumn"
import format from "./format"

let defaultDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc hendrerit ligula sit amet tortor auctor semper. Aliquam aliquet, augue non consectetur congue, eros enim tempor ipsum, ac fringilla odio tellus a sapien. Integer maximus sem id justo consectetur, vitae porttitor est efficitur.'

let defaults = {
  HDI: 'The HDI is a summary measure for assessing long-term progress in three basic dimensions of human development: a long and healthy life, access to knowledge and a decent standard of living.',
  IHDI: 'The IHDI considers inequalities in all three dimensions of the HDI by ‘discounting’ each dimension’s average value according to its level of inequality in the distribution. The ‘loss’ in human development due to inequality is given by the difference between the HDI and the IHDI. As the inequality in a country increases, the loss in human development also increases.',
  GDI: 'The GDI measures gender gaps in achievements in three basic dimensions of human development: health (measured by female and male life expectancy at birth), knowledge (measured by female and male expected years of schooling for children and mean years of schooling for adults aged 25 years and older) and living standards (measured by female and male estimated GNI per capita). It is a ratio of the female to the male HDI.',
  GII: 'The GII measures gender inequalities (the loss in human development due to inequality between female and male achievements) in three key dimensions – reproductive health, empowerment, and labour market. Reproductive health is measured by maternal mortality ratio and adolescent birth rates; empowerment is measured by the shares of parliamentary seats held and population with at least some secondary education by each gender; and labour market participation is measured by the labour force participation rates for women and men.',
  MPI: 'The MPI looks beyond income to understand how people experience poverty in multiple and simultaneous ways. It identifies how people are being left behind across three key dimensions: health, education and standard of living, comprising 10 indicators. People who experience deprivation in at least one third of these weighted indicators fall into the category of multidimensionally poor.',
  PHDI: 'The PHDI discounts the HDI for pressures on the planet to reflect a concern for intergenerational inequality. It is the level of human development adjusted by carbon dioxide emissions per person (production-based) and material footprint per capita to account for the excessive human pressure on the planet. In an ideal scenario where there are no pressures on the planet, the PHDI equals the HDI. However, as pressures increase, the PHDI falls below the HDI. In this sense, the PHDI measures the level of human development when planetary pressures are considered.'
}

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
  const countryHasData = lastColumnWithData !== undefined
  if (!countryHasData) {
    return <p>{defaults[index.key]}</p>
  } else {

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
      const countCountries = data.filter(d => d.ISO3 !== '').length
      description = (
        <>
          <p>
            {defaults[index.key]} {getCountryWithApostrophe(country.Country)} HDI value for {latestYear} is {latestValueFormatted}— which put the country in the {country.hdicode} human development category—positioning it at {country[`hdi_rank_${latestYear}`]} out of {countCountries} countries and territories.
          </p>
          <p>
            Between {firstYear} and {latestYear}, {getCountryWithApostrophe(country.Country)} HDI value increased from {firstValueFormatted} to {latestValueFormatted}, an increase of {percentChangeFormatted} percent.
          </p>
          <p>
            Between {firstYear} and {latestYear}, {getCountryWithApostrophe(country.Country)} life expectancy at birth increased by {leIncrease} years, mean years of schooling increased by {mysIncrease} years and expected years of schooling increased by {eysIncrease} years. {getCountryWithApostrophe(country.Country)} GNI per capita increased by about {gnipcPercentIncreaseIncrease} percent between {firstYear} and {latestYear}.
          </p>
        </>
      )
    } else if (index.key === 'IHDI') {
      const lossFormatted = format(country[`loss_${latestYear}`], 'loss')
      description = (
        <p>
          {defaults[index.key]} {getCountryWithApostrophe(country.Country)} loss due to inequality is {lossFormatted} percent, which lowers the HDI to {latestValueFormatted} in {latestYear}.
        </p>
      )
    } else if (index.key === 'GDI') {
      const femaleHdi = format(country[`hdi_f_${latestYear}`], 'hdi_f')
      const maleHdi = format(country[`hdi_m_${latestYear}`], 'hdi_m')
      const group = country[`gdi_group_2021`]
      const groupText = group !== '' ? `, placing it into Group ${group}` : ''
      description = (
        <p>
          {defaults[index.key]} The {latestYear} female HDI value for {country.Country} is {femaleHdi} in contrast with {maleHdi} for males, resulting in a GDI value of {latestValueFormatted}{groupText}.
        </p>
      )
    } else if (index.key === 'GII') {
      const countCountriesWithGII = data.filter(country => {
        return country.ISO3 && country[`gii_${latestYear}`] !== ''
      }).length
      description = (
        <p>
          {defaults[index.key]} {country.Country} has a GII value of {latestValueFormatted}, ranking it {country[`gii_rank_${latestYear}`]} out of {countCountriesWithGII} countries in {latestYear}.
        </p>
      )
    } else if (index.key === 'MPI') {
      description = (
        <p>
          {defaults[index.key]}
        </p>
      )
    } else if (index.key === 'PHDI') {
      description = (
        <p>
          {defaults[index.key]}
        </p>
      )
    }
  }

  return description || defaultDescription
}
