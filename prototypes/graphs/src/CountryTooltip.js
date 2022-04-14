import './CountryTooltip.scss'
import getGraphColumnsForKey from './getGraphColumnsForKey'
import getYearOfColumn from './getYearOfColumn'
function ChangeTooltipHeader(props) {
  const { point, data, index } = props
  console.log(point)
  const country = point.hover[2].row
  const column = point.hover[2].col
  const year = getYearOfColumn(column)
  const allColumns = getGraphColumnsForKey(data, index.key)
  const columnIndex = allColumns.indexOf(column)
  const value = +country[column]
  let previousYear = null
  if (columnIndex > 0) {
    const previousColumn = allColumns[columnIndex - 1]
    previousYear = getYearOfColumn(previousColumn)
    const previousValue = +country[previousColumn]
    const difference = value - previousValue
    previousYear = (
      <div className='stat'>
        <div className='label'>{index.key} change from {previousYear}</div>
        <div className='value'>{difference > 0 ? '+' : ''}{difference.toFixed(3)}</div>
      </div>
    )
  }
  return (
    <>

      <div className='countryName'>{country.Country}</div>
      <hr />
      <div className='stat'>
        <div className='label'>{year} {index.key} value</div>
        <div className='value'>{value}</div>
      </div>
      {previousYear}
    </>
  )
}
function GenderTable(props) {
  const { tableKeys, point } = props

  const country = point.hover[2].row
  const column = point.hover[2].col

  const year = getYearOfColumn(column)
  return (
    <table>
      <thead>
        <tr>
          <td />
          <td>Female</td>
          <td>Male</td>
          <td>Gender gap</td>
        </tr>
      </thead>
      <tbody>
        {tableKeys.map(({label, key, suffix}) => {
          const fValue = country[`${key}_f_${year}`]
          const mValue = country[`${key}_m_${year}`]
          let s = suffix ? (<span className='suffix'> {suffix}</span>) : null
          return (
            <tr key={key}>
              <td>{label}</td>
              <td>{fValue}{s}</td>
              <td>{mValue}{s}</td>
              <td>{(fValue - mValue).toFixed(3)}{s}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

}
function GDIScatterTooltip(props) {
  const tableKeys = [
    { label: 'HDI Value', key: 'hdi' },
    { label: 'Life Expectancy at Birth', key: 'le', suffix: 'years', },
    { label: 'Expected Years of Schooling', key: 'eys', suffix: 'years', },
    { label: 'Mean Years of Schooling', key: 'mys', suffix: 'years', },
    { label: 'Gross National Income Per Capita', key: 'gni_pc' },

  ]

  return (
    <div>
      <ChangeTooltipHeader {...props} />
      <hr />
      <GenderTable tableKeys={tableKeys} {...props} />
    </div>

  )
}

function GIIScatterTooltip(props) {
  const { point } = props
  const country = point.hover[2].row
  const column = point.hover[2].col
  const year = getYearOfColumn(column)

  const tableKeys = [
    { label: 'Share of seats in parliament', key: 'pr', suffix: '%' },
    { label: 'Population with at least some secondary education', key: 'se', suffix: '%' },
    { label: 'Labour force participation rate (age 25 and older)', key: 'lfpr', suffix: '%' },

  ]
  return (
    <div>
      <ChangeTooltipHeader {...props} />
      <hr />
      <div className='stat'>
        <div className='label'>Maternal Mortality Ratio</div>
        <div className='value'>{country[`mmr_${year}`]}<span className='suffix'> death/100,000 live births</span></div>
      </div>
      <div className='stat'>
        <div className='label'>Adolescent Birth Rate</div>
        <div className='value'>{country[`abr_${year}`]}<span className='suffix'> births/1,000 women age 15-19</span></div>
      </div>

      <GenderTable tableKeys={tableKeys} {...props} />
    </div>
  )
}

export default function CountryTooltip(props) {
  const { point, index, graph } = props

  const style = {
    transform: `translate(${point.x}px, ${point.y}px)`
  }
  let tooltipContents = null

  console.log(index, graph)
  if (index && graph) {
    if (index.key === 'GDI' && graph.type === 'scatter') {
      tooltipContents = <GDIScatterTooltip {...props} />
    } else if (index.key === 'GII' && graph.type === 'scatter') {
      tooltipContents = <GIIScatterTooltip {...props} />
    }
  }
  if (!tooltipContents) {
    return null
  }
  return (
    <div className='CountryTooltip' style={style}>
      {tooltipContents}
    </div>
  )
}