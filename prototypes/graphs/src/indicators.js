import MPIGraph from "./MPIGraph"
import PPAHDIGraph from "./PPAHDIGraph"
const indicators =  [
  {
    key: 'HDI',
    name: 'Human Development Index',
  },
  {
    key: 'GDI',
    name: 'Gender Development Index',
  },
  {
    key: 'IHDI',
    name: 'Inequality-adjusted HDI'
  },
  {
    key: 'GII',
    name: 'Gender Inequality index',
  },
  {
    key: 'MPI',
    name: 'Multidimensional Poverty Index',
    customGraph: <MPIGraph />
  },
  {
    key: 'PHDI',
    name: 'Planetary pressures-adjusted HDI',
    customGraph: <PPAHDIGraph />
  }
]

export default indicators
