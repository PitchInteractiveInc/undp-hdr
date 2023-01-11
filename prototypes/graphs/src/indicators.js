import GSNIGraphWrapper from "./GSNIGraph"
import MPIGraph from "./MPIGraph"
import PPAHDIGraph from "./PPAHDIGraph"
const indicators =  [

  {
    key: 'HDI',
    name: 'Human Development Index',
    countryGraphs: [
      {
        type: 'hdiIntro',
        title: ({country}) => null,
        noCountrySelection: true,
      },
      {
        type: 'difference',
        title: ({country, extent}) => <>Trends in {country}'s HDI<br className='mobileBreak' /> {extent.join(' – ')}</>,
        noCountrySelection: true,
      },
      {
        type: 'scatter',
        title: ({country, extent}) =>  <>HDI in comparison<br className='mobileBreak' /> {extent.join(' – ')}</>,
        pageBreakAfter: true,
      }
    ],
  },
  {
    key: 'GDI',
    name: 'Gender Development Index',
    countryGraphs: [
      {
        type: 'scatter',
        title: ({country, extent}) =>  <>GDI in comparison<br className='mobileBreak' /> {extent.join(' – ')}</>,

      }
    ],
    pageBreakBefore: true,
  },
  {
    key: 'IHDI',
    name: 'Inequality-adjusted HDI',
    pageBreakAfter: true,
    countryGraphs: [
      {
        type: 'difference',
        title: ({country, extent}) =>  <>IHDI in comparison<br className='mobileBreak' /> {extent.join(' – ')}</>,
      }
    ],
  },
  {
    key: 'GII',
    name: 'Gender Inequality index',
    countryGraphs: [
      {
        type: 'scatter',
        title: ({country, extent}) =>  <>GII in comparison<br className='mobileBreak' /> {extent.join(' – ')}</>,
      }
    ],
    lowerBetter: true,
  },
  {
    key: 'GSNI',
    name: 'GSNI',
    customGraph: <GSNIGraphWrapper />,
    countryGraphs: [{
      type: 'bar',
      title: ({country, extent}) => `GSNI in comparison of latest year`,

    }],
    lowerBetter: true,
  },
  {
    key: 'MPI',
    name: 'Multidimensional Poverty Index',
    pageBreakAfter: true,
    customGraph: <MPIGraph />,
    countryGraphs: [
      {
        type: 'bar',
        title: ({country, extent}) => `MPI in comparison of latest year`,

      }
    ],
    lowerBetter: true,
  },
  {
    key: 'PHDI',
    name: 'Planetary pressures-adjusted HDI',
    customGraph: <PPAHDIGraph />,
    countryGraphs: [
      {
        type: 'bar',
        title: ({country, extent}) => `PHDI in comparison of year ${extent[1]}`,

      }
    ],
  }
]

export default indicators
