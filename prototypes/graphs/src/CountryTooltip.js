import classNames from 'classnames'
import './CountryTooltip.scss'
import getGraphColumnsForKey from './getGraphColumnsForKey'
import getYearOfColumn from './getYearOfColumn'
import format from './format'
function Stat(props) {
  const { label, value, suffix, bold, bottomBorder, valueClass } = props
  const s = suffix ? (<span className='suffix'>{suffix}</span>) : null
  return (
    <div className={classNames('stat', { bold, bottomBorder })}>
      <div className='label'>{label}</div>
      <div className={classNames('value', valueClass)}>{value}{s}</div>
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
        bold
        label={`${index.key} change from ${previousYear}`}
        value={`${difference > 0 ? '+' : ''}${format(difference)}`}
        valueClass={difference > 0 ? 'positive' : 'negative'}
      />
    )
  }
  return (
    <>

      <div className='countryName'>{country.Country}</div>
      <hr />
      <Stat
        bold
        label={`${year ? year : ''} ${index.key} value`}
        value={format(value)}
      />
      {previousYear}
    </>
  )
}
function GenderTable(props) {
  const { tableKeys, point, firstColumnWidth } = props

  const country = point.hover[2].row
  const column = point.hover[2].col

  const year = getYearOfColumn(column)
  return (
    <table className='genderTable'>
      <thead>
        <tr>
          <td />
          <td>Female</td>
          <td>Male</td>
          <td className='negative'>Gender gap</td>
        </tr>
      </thead>
      <tbody>
        {tableKeys.map(({label, key, suffix}) => {
          const fValue = country[`${key}_f_${year}`]
          const mValue = country[`${key}_m_${year}`]
          let s = suffix ? (<span className='suffix'>{suffix}</span>) : null
          return (
            <tr key={key}>
              <td style={{ width: firstColumnWidth}}>{label}</td>
              <td>{format(fValue, key)}{s}</td>
              <td>{format(mValue, key)}{s}</td>
              <td className='negative' style={{ textAlign: 'right'}}>{format(fValue - mValue, key)}{s}</td>
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
    { label: 'Life Expectancy at Birth', key: 'le', suffix: ' years', },
    { label: 'Expected Years of Schooling', key: 'eys', suffix: ' years', },
    { label: 'Mean Years of Schooling', key: 'mys', suffix: ' years', },
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
    { label: <>Population with at least some<br />secondary education<br />(age 25 and older)</>, key: 'se', suffix: '%' },
    { label: <>Labour force participation rate<br />(age 25 and older)</>, key: 'lfpr', suffix: '%' },

  ]
  return (
    <div>
      <ChangeTooltipHeader {...props} />
      <hr />
      <Stat
        label='Maternal Mortality Ratio'
        value={format(country[`mmr_${year}`], 'mmr')}
        suffix='death/100,000 live births'
      />
      <Stat
        label='Adolescent Birth Rate'
        value={format(country[`abr_${year}`], 'abr')}
        suffix='births/1,000 women age 15-19'
      />
      <GenderTable firstColumnWidth='20em' tableKeys={tableKeys} {...props} />
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
      <hr />
      <Stat
        label='HDI value'
        value={format(country[`hdi_${year}`], 'hdi')}
        bottomBorder
      />
      <Stat
        label='Overall loss (from HDI to IHDI)'
        value={format(country[`loss_${year}`], 'loss')}
        suffix='%'
        bottomBorder
      />
      <Stat
        label='Inequality in life expectancy'
        value={format(country[`ineq_le_${year}`], 'ineq_le')}
        suffix='%'
        bottomBorder
      />
      <Stat
        label='Inequality in education'
        value={format(country[`ineq_edu_${year}`], 'ineq_edu')}
        suffix='%'
        bottomBorder
      />
      <Stat
        label='Inequality in income'
        value={format(country[`ineq_inc_${year}`], 'ineq_inc')}
        suffix='%'
        bottomBorder
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
        value={format(country[`le_${year}`], 'le')}
        suffix=' years'
        bottomBorder
      />
      <Stat
        label='Expected years of schooling'
        value={format(country[`eys_${year}`], 'eys')}
        suffix=' years'
        bottomBorder
      />
      <Stat
        label='Mean years of schooling'
        value={format(country[`mys_${year}`], 'mys')}
        suffix=' years'
        bottomBorder
      />
      <Stat
        label='Gross National Income per capita'
        value={format(country[`gnipc_${year}`], 'gnipc')}
        suffix=' (constant 2017 PPP$)'
        bottomBorder
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
    <table className='HDIScatterTooltip'>
      <thead>
        <tr>
          <td>HDI Value</td>
          {yearKeys.map(key => <td key={key} style={{ fontWeight: key === column ? 'bold' : null}}>{getYearOfColumn(key)}</td>)}
        </tr>
      </thead>
      <tbody>
        {allRows.map(row => {
          const country = row.row
          return (
            <tr key={country.Country} style={{ color: row.color}}>
              <td>{country.Country}</td>
              {yearKeys.map(key => {
                const fontWeight = key === column ? 'bold' : 'normal'
                const value = country[key]
                const allColumnIndex = allColumns.indexOf(key)
                let difference = null
                if (allColumnIndex > 0) {
                  const prevValue = country[allColumns[allColumnIndex - 1]]
                  const diff = (value - prevValue)
                  const className = diff > 0 ? 'positive' : 'negative'
                  const arrow = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="4" viewBox="0 0 8 4">
                      <path d="M4,0,8,4H0Z" className={classNames('arrow', className)}/>
                    </svg>
                  )

                  difference = <div className={className}>{arrow}{diff.toFixed(3)}</div>
                }
                return <td key={key} style={{ fontWeight }}>{value}{difference}</td>
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
        value={format(country[`hdi_${year}`], 'hdi')}
      />
      <Stat
        label='PHDI value'
        value={format(country[`phdi_${year}`], 'phdi')}
      />
      <Stat
        label='Difference from HDI value (%)'
        value={format(country[`diff_hdi_phdi_${year}`], 'diff_hdi_phdi')}
      />
      <Stat
        label='Difference from HDI rank'
        value={format(country[`rankdiff_hdi_phdi_${year}`], 'rankdiff_hdi_phdi')}
      />
      <hr />
      <Stat
        label='Material footprint per capita (tonnes)'
        value={format(country['co2_prod_2018'], 'co2_prod')}
        bottomBorder
      />
      <Stat
        label='Carbon dixoide per capita (production, tonnes)'
        value={format(country['mf_2017'], 'mf')}
        bottomBorder
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