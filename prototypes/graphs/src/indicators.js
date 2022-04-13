import MPIGraph from "./MPIGraph"
import PPAHDIGraph from "./PPAHDIGraph"
const indicators =  [
  {
    key: 'HDI',
    name: 'Human Development Index',
    countryGraphTypes: ['difference', 'scatter'],
    countryGraphComparisonSelectableCountries: [0, 3],
  },
  {
    key: 'GDI',
    name: 'Gender Development Index',
    countryGraphTypes: ['scatter'],
    countryGraphComparisonSelectableCountries: [1],
  },
  {
    key: 'IHDI',
    name: 'Inequality-adjusted HDI',
    countryGraphTypes: ['difference'],
    countryGraphComparisonSelectableCountries: [1],
  },
  {
    key: 'GII',
    name: 'Gender Inequality index',
    countryGraphTypes: ['scatter'],
    countryGraphComparisonSelectableCountries: [1]
  },
  {
    key: 'MPI',
    name: 'Multidimensional Poverty Index',
    customGraph: <MPIGraph />,
    countryGraphTypes: ['bar'],
    countryGraphComparisonSelectableCountries: [3]
  },
  {
    key: 'PHDI',
    name: 'Planetary pressures-adjusted HDI',
    customGraph: <PPAHDIGraph />,
    countryGraphTypes: ['bar'],
    countryGraphComparisonSelectableCountries: [3]
  }
]

export default indicators
