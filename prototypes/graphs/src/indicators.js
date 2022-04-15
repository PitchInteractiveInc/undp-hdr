import MPIGraph from "./MPIGraph"
import PPAHDIGraph from "./PPAHDIGraph"
const indicators =  [
  {
    key: 'HDI',
    name: 'Human Development Index',
    countryGraphs: [
      {
        type: 'difference',
        title: ({country, extent}) => `Trends in ${country}'s HDI ${extent.join(' – ')}`,
      },
      {
        type: 'scatter',
        title: ({country, extent}) => `${country}'s HDI in comparison ${extent.join(' – ')}`,
      }
    ],
  },
  {
    key: 'GDI',
    name: 'Gender Development Index',
    countryGraphs: [
      {
        type: 'scatter',
        title: ({country, extent}) => `${country}'s GDI in comparison ${extent.join(' – ')}`,

      }
    ],
  },
  {
    key: 'IHDI',
    name: 'Inequality-adjusted HDI',
    countryGraphs: [
      {
        type: 'difference',
        title: ({country, extent}) => `${country}'s IHDI in comparison ${extent.join(' – ')}`,
      }
    ],
  },
  {
    key: 'GII',
    name: 'Gender Inequality index',
    countryGraphs: [
      {
        type: 'scatter',
        title: ({country, extent}) => `${country}'s GII in comparison ${extent.join(' – ')}`,

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
        title: ({country, extent}) => `${country}'s MPI in comparison of latest year`,

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
        title: ({country, extent}) => `${country}'s PHDI in comparison of year ${extent[1]}`,

      }
    ],
  }
]

export default indicators
