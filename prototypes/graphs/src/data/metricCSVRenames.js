import { csvParse } from 'd3-dsv';

const renames = csvParse(`Full name,Short name
ISO3,iso3
HDR Country Name,country
Human Development Groups,hdicode
UNDP Developeing Regions,region
HDI Rank,HDI_rank
Human Development Index (value),HDI
Life Expectancy at Birth (years),LE
Expected Years of Schooling (years),EYS
Mean Years of Schooling (years),MYS
Gross National Income Per Capita (2017 PPP$),GNI_pc
Gross National Income Per Capita (2017 PPP$),GNIpc
GDI Group,GDI_group
Gender Development Index (value),GDI
HDI female,HDI_f
"Life Expectancy at Birth, female (years)",LE_f
"Expected Years of Schooling, female (years)",EYS_f
"Mean Years of Schooling, female (years)",MYS_f
"Gross National Income Per Capita, female (2017 PPP$)",GNI_pc_f
HDI male,HDI_m
"Life Expectancy at Birth, male (years)",LE_m
"Expected Years of Schooling, male (years)",EYS_m
"Mean Years of Schooling, male (years)",MYS_m
"Gross National Income Per Capita, male (2017 PPP$)",GNI_pc_m
HDI,HDI
Inequality-adjusted Human Development Index (value),IHDI
Coefficient of human inequality,Coef_ineq
Overall loss (%),Loss
Inequality in life expectancy,Ineq_LE
Inequality in eduation,Ineq_edu
Inequality in income,Ineq_inc
GII Rank,GII_rank
Gender Inequality Index (value),GII
"Maternal Mortality Ratio (deaths per 100,000 live births)",MMR
"Adolescent Birth Rate (births per 1,000 women ages 15-19)",ABR
"Population with at least some secondary education, female (% ages 25 and older)",SE_f
"Population with at least some secondary education, male (% ages 25 and older)",SE_m
"Share of seats in parliament, female (% held by women)",PR_f
"Share of seats in parliament, male (% held by men)",PR_m
"Labour force participation rate, female (% ages 15 and older)",LFPR_f
"Labour force participation rate, male (% ages 15 and older)",LFPR_m
HDI Rank,HDI_rank
Planetary pressures–adjusted Human Development Index (value),PHDI
HDI,HDI
Difference from HDI value (%),Diff_HDI_PHDI
Difference from HDI rank,Rankdiff_HDI_PHDI
Carbon dioxide emissions per capita (production) (tonnes),CO2_prod
Material footprint per capita (tonnes),MF
Population,pop_total
Multidimensional Poverty Index,MPI
`)

const getCSVColumnName = shortName => {
  const yearRegex = /_\d{4}$/
  const hasYear = shortName.match(yearRegex)
  let year = null
  if (hasYear) {
    year = hasYear[0].substr(1)
  }
  const shortNameWithYearRemoved = shortName.replace(yearRegex, '')

  const rename = renames.find(r => r['Short name'].toLowerCase() === shortNameWithYearRemoved.toLowerCase())
  if (rename) {
    return `${rename['Full name']}${hasYear ? ` (${year})` : ''}`
  } else {
    // console.warn('No rename found for', shortName)
    return shortName
  }
}

export default function renameColumns(dataObject) {
  const newDataObject = {}
  Object.keys(dataObject).forEach(key => {
    const newKey = getCSVColumnName(key)
    newDataObject[newKey] = dataObject[key]
  })

  return newDataObject
}
