import './CountryTooltip.scss'
import getGraphColumnsForKey from './getGraphColumnsForKey'
import getYearOfColumn from './getYearOfColumn'

function Stat(props) {
  const { label, value, suffix } = props
  const s = suffix ? (<span className='suffix'> {suffix}</span>) : null
  return (
    <div className='stat'>
      <div className='label'>{label}</div>
      <div className='value'>{value}{s}</div>
    </div>
  )
}
function ChangeTooltipHeader(props) {
  const { point, data, index } = props
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
      <Stat
        label={`${index.key} change from ${previousYear}`}
        value={`${difference > 0 ? '+' : ''}${difference.toFixed(3)}`}
      />
    )
  }
  return (
    <>

      <div className='countryName'>{country.Country}</div>
      <hr />
      <Stat
        label={`${year ? year : ''} ${index.key} value`}
        value={value}
      />
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
      <Stat
        label='Maternal Mortality Ratio'
        value={country[`mmr_${year}`]}
        suffix='death/100,000 live births'
      />
      <Stat
        label='Adolescent Birth Rate'
        value={country[`abr_${year}`]}
        suffix='births/1,000 women age 15-19'
      />
      <GenderTable tableKeys={tableKeys} {...props} />
    </div>
  )
}

function IHDIDifferenceTooltip(props) {
  const { point } = props
  const country = point.hover[2].row
  const column = point.hover[2].col
  const year = getYearOfColumn(column)

  return (
    <div>
      <ChangeTooltipHeader {...props} />
      <Stat
        label='HDI value'
        value={country[`hdi_${year}`]}
      />
      <Stat
        label='Overall loss (from HDI to IHDI)'
        value={country[`loss_${year}`]}
        suffix='%'
      />
      <Stat
        label='Inequality in life expectancy'
        value={country[`ineq_le_${year}`]}
        suffix='%'
      />
      <Stat
        label='Inequality in education'
        value={country[`ineq_edu_${year}`]}
        suffix='%'
      />
      <Stat
        label='Inequality in income'
        value={country[`ineq_inc_${year}`]}
        suffix='%'
      />
    </div>
  )
}


function HDIDifferenceTooltip(props) {
  const { point } = props
  const country = point.hover[2].row
  const column = point.hover[2].col
  const year = getYearOfColumn(column)

  return (
    <div>
      <ChangeTooltipHeader {...props} />
      <hr />
      <Stat
        label='Life expectancy at birth'
        value={country[`le_${year}`]}
        suffix='years'
      />
      <Stat
        label='Expected years of schooling'
        value={country[`eys_${year}`]}
        suffix='years'
      />
      <Stat
        label='Mean years of schooling'
        value={country[`mys_${year}`]}
        suffix='years'
      />
      <Stat
        label='Gross National Income per capita'
        value={country[`gni_pc_${year}`]}
        suffix='(constant 2017 PPP$)'
      />
    </div>
  )
}

export function HDIScatterTooltip(props) {
  const { allRows, point, data, index } = props

  const country = point.hover[2].row
  const column = point.hover[2].col
  const year = getYearOfColumn(column)
  const allColumns = getGraphColumnsForKey(data, index.key)
  const columnIndex = allColumns.indexOf(column)
  const yearKeys = []
  if (columnIndex > 0) {
    yearKeys.push(allColumns[columnIndex - 1])
  }
  yearKeys.push(column)
  if (columnIndex < allColumns.length - 1) {
    yearKeys.push(allColumns[columnIndex + 1])
  }
  return (
    <table>
      <thead>
        <tr>
          <td>HDI Value</td>
          {yearKeys.map(key => <td key={key}>{getYearOfColumn(key)}</td>)}
        </tr>
      </thead>
      <tbody>
        {allRows.map(row => {
          const country = row.row
          return (
            <tr key={country.Country}>
              <td>{country.Country}</td>
              {yearKeys.map(key => {
                return <td key={key}>{country[key]}</td>
              })}

            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function MPIBarTooltip(props) {
  const { point } = props
  const country = point.hover[2].row
  const column = point.hover[2].col
  const year = getYearOfColumn(column)

  return (
    <div>
      <ChangeTooltipHeader {...props} />
    </div>
  )
}

function PHDIBarTooltip(props) {
  const { point } = props
  const country = point.hover[2].row
  const column = point.hover[2].col
  const year = getYearOfColumn(column)

  return (
    <div>
      <div className='countryName'>{country.Country}</div>
      <hr />
      <Stat
        label='HDI value'
        value={country[`hdi_${year}`]}
      />
      <Stat
        label='PHDI value'
        value={country[`phdi_${year}`]}
      />
      <Stat
        label='Difference from HDI value (%)'
        value={country[`diff_hdi_phdi_${year}`]}
      />
      <Stat
        label='Difference from HDI rank'
        value={country[`rankdiff_hdi_phdi_${year}`]}
      />
      <hr />
      <Stat
        label='Material footprint per capita (tonnes)'
        value={country['co2_prod_2018']}
      />
      <Stat
        label='Carbon dixoide per capita (production, tonnes)'
        value={country['mf_2017']}
      />


    </div>
  )

}
export default function CountryTooltip(props) {
  const { point, index, graph } = props

  const style = {
    transform: `translate(${point.x}px, ${point.y}px)`
  }
  let tooltipContents = null

  if (index && graph) {
    if (index.key === 'GDI' && graph.type === 'scatter') {
      tooltipContents = <GDIScatterTooltip {...props} />
    } else if (index.key === 'GII' && graph.type === 'scatter') {
      tooltipContents = <GIIScatterTooltip {...props} />
    } else if (index.key === 'IHDI' && graph.type === 'difference') {
      tooltipContents = <IHDIDifferenceTooltip {...props} />
    } else if (index.key === 'HDI' && graph.type === 'difference') {
      tooltipContents = <HDIDifferenceTooltip {...props} />
    } else if (index.key === 'HDI' && graph.type === 'scatter') {
      tooltipContents = <HDIScatterTooltip {...props} />
    } else if (index.key === 'MPI' && graph.type === 'bar') {
      tooltipContents = <MPIBarTooltip {...props} />
    } else if (index.key === 'PHDI' && graph.type === 'bar') {
      tooltipContents = <PHDIBarTooltip {...props} />
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