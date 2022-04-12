import MPIGraph from "./MPIGraph"
import PPAHDIGraph from "./PPAHDIGraph"
const indicators =  [
  {
    key: 'HDI',
    name: 'Human Development Index',
    countryGraphTypes: ['difference', 'scatter'],
  },
  {
    key: 'GDI',
    name: 'Gender Development Index',
    countryGraphTypes: ['scatter'],
  },
  {
    key: 'IHDI',
    name: 'Inequality-adjusted HDI',
    countryGraphTypes: ['difference'],
  },
  {
    key: 'GII',
    name: 'Gender Inequality index',
    countryGraphTypes: ['scatter'],
  },
  {
    key: 'MPI',
    name: 'Multidimensional Poverty Index',
    customGraph: <MPIGraph />,
    countryGraphTypes: ['bar'],
  },
  {
    key: 'PHDI',
    name: 'Planetary pressures-adjusted HDI',
    customGraph: <PPAHDIGraph />,
    countryGraphTypes: ['bar'],
  }
]

export default indicators
