import MPIGraph from "./MPIGraph"
import PPAHDIGraph from "./PPAHDIGraph"
const indicators =  [
  {
    key: 'HDI',
    name: 'Human Development Index',
    countryGraphs: [
      {
        type: 'difference',
        countSelectable: 0,
      },
      {
        type: 'scatter',
        countSelectable: 3,
      }
    ],
  },
  {
    key: 'GDI',
    name: 'Gender Development Index',
    countryGraphs: [
      {
        type: 'scatter',
        countSelectable: 1,
      }
    ],
  },
  {
    key: 'IHDI',
    name: 'Inequality-adjusted HDI',
    countryGraphs: [
      {
        type: 'difference',
        countSelectable: 1,
      }
    ],
  },
  {
    key: 'GII',
    name: 'Gender Inequality index',
    countryGraphs: [
      {
        type: 'scatter',
        countSelectable: 1,
      }
    ],
  },
  {
    key: 'MPI',
    name: 'Multidimensional Poverty Index',
    customGraph: <MPIGraph />,
    countryGraphs: [
      {
        type: 'bar',
        countSelectable: 3,
      }
    ],
  },
  {
    key: 'PHDI',
    name: 'Planetary pressures-adjusted HDI',
    customGraph: <PPAHDIGraph />,
    countryGraphs: [
      {
        type: 'bar',
        countSelectable: 3,
      }
    ],
  }
]

export default indicators
