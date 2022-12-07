import classNames from 'classnames'
import './CountryTooltip.scss'
import getGraphColumnsForKey from './getGraphColumnsForKey'
import getYearOfColumn from './getYearOfColumn'
import format from './format'
import { mpiColors } from './MPIGraph'
import { gsniColors } from './GSNIGraph'
import {hdiIntroColorScale} from './HDIIntroGraph'
import { scaleSqrt, scaleLinear } from 'd3-scale'
import { arc } from 'd3-shape'
import { useEffect, useRef, useState } from 'react'
import { useClickAway, useMedia } from 'react-use'
import { sum, max } from 'd3-array'
function Stat(props) {
  const { label, value, suffix, bold, bottomBorder, valueClass, negative } = props
  const s = suffix ? (<span className='suffix'>{suffix}</span>) : null
  return (
    <div className={classNames('stat', { bold, bottomBorder, negative })}>
      <div className='statLabel'>{label}</div>
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
  let label = `${year ? year : ''} ${index.key} value`
  if (props.label) {
    label = props.label
  }
  return (
    <>

      <div className='countryName'>{country.Country}</div>
      <hr />
      <Stat
        bold
        label={label}
        value={format(value,props.formatKey)}
        suffix={props.suffix}
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
          <td style={{ paddingRight: '0.6em'}}>Female </td>
          <td>Male</td>
          <td className='negative' style={{ paddingLeft: '0.3em'}}>Gender gap</td>
        </tr>
      </thead>
      <tbody>
        {tableKeys.map(({label, key, suffix, colorGenders, showGraph}) => {
          const fValue = country[`${key}_f_${year}`]
          const mValue = country[`${key}_m_${year}`]
          let s = suffix ? (<span className='suffix'>{suffix}</span>) : null
          const maleColor = colorGenders ? 'rgba(31, 90, 149, 0.5)' : null
          const femaleColor = colorGenders ? '#1F5A95' : null
          let graph = null
          if (showGraph) {
            const max = Math.max(mValue, fValue)
            const radiusScale = scaleSqrt()
              .domain([0, max])
              .range([0, 20])
            const arcGen = arc()
            const maleRadius = radiusScale(mValue)
            const femaleRadius = radiusScale(fValue)
            const stroke = '#1F5A95'
            graph = (
              <svg width={40} height={40} style={{ padding: '0.5em 1em'}}>
                <g fontSize='0.875em' fill={stroke} transform={`translate(20, 0)`}>
                  <path d={arcGen({
                    innerRadius: 0,
                    outerRadius: maleRadius,
                    startAngle: 0,
                    endAngle: Math.PI,

                    })}
                    fill={stroke}
                    opacity='0.5'
                    transform={`translate(0, ${20 - maleRadius + 20})`}
                  />
                  <path d={arcGen({
                    innerRadius: 0,
                    outerRadius: femaleRadius,
                    startAngle: Math.PI,
                    endAngle: 2 * Math.PI,
                    })}
                    fill={stroke}
                    transform={`translate(0, ${20 -femaleRadius + 20})`}

                  />
                </g>
              </svg>
            )
          }
          return (
            <tr key={key}>
              <td style={{ width: firstColumnWidth}}>{label}</td>
              <td>
                <span style={{ fontWeight: '600', color: femaleColor, transform: graph ? 'translateY(-1.5em)' : null, display: 'inline-block'}}>{format(fValue, key)}</span>{s}{graph}
              </td>
              <td><span style={{ fontWeight: '600', color: maleColor}}>{format(mValue, key)}</span>{s}</td>
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
    { label: 'HDI Value', key: 'hdi', colorGenders: true, showGraph: true },
    { label: <>Life Expectancy at<br />Birth</>, key: 'le', suffix: ' years', },
    { label: <>Expected Years of<br />Schooling</>, key: 'eys', suffix: ' years', },
    { label: 'Mean Years of Schooling', key: 'mys', suffix: ' years', },
    { label: 'Gross National Income Per Capita (2017 PPP$)', key: 'gni_pc' },

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
    { label: <>Labour force participation rate<br />(age 15 and older)</>, key: 'lfpr', suffix: '%' },

  ]
  return (
    <div>
      <ChangeTooltipHeader {...props} />
      <hr />
      <Stat
        label='Maternal Mortality Ratio'
        value={format(country[`mmr_${year}`], 'mmr')}
        suffix=' death/100,000 live births'
      />
      <Stat
        label='Adolescent Birth Rate'
        value={format(country[`abr_${year}`], 'abr')}
        suffix=' births/1,000 women age 15-19'
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
        negative
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

  const column = point.hover[2].col
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
                const value = format(country[key], index.key)
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
  const mpiMetrics = Object.keys(mpiColors)
  const svgHeight = 315
  const svgWidth = 373
  const barWidth = 167
  const textPadding = 10
  let runningY = 0
  const numNonZero = mpiMetrics.filter(metric => +country[metric] !== 0).length
  const barPadding = 1
  const totalBarPadding = barPadding * (numNonZero - 1)
  const availableHeight = svgHeight - totalBarPadding
  const minBarHeight = 12
  let extraBarHeight = 0
  const rects = mpiMetrics.map(metric => {
    const value = country[metric]
    if (value === '' || value === '0') {
      return null
    }
    // console.log(metric, value)
    let rectHeight = availableHeight * (value / 100)
    if (rectHeight < minBarHeight) {
      extraBarHeight += minBarHeight - rectHeight
      rectHeight = minBarHeight
    }
    const rectY = runningY
    runningY += rectHeight + barPadding
    return (
      <g key={metric} transform={`translate(0, ${rectY})`}>
        <rect
          width={barWidth}
          height={rectHeight}
          fill={mpiColors[metric]}
        />
        <text
          x={barWidth + textPadding}
          dy='0.85em'
          fill={mpiColors[metric]}
          fontWeight='bold'
        >
          {metric}: {format(value, 'mpi')}%
        </text>

      </g>
    )
    })
  return (
    <div>
      <ChangeTooltipHeader {...props} />
      <hr />
      <svg width={svgWidth} height={svgHeight + extraBarHeight}>
        <g>

          {rects}

        </g>
      </svg>
    </div>
  )
}

function GSNIBarTooltip(props) {
  const { point } = props
  const country = point.hover[2].row
  const gsniMetrics = Object.keys(gsniColors)
  const svgHeight = 315 / 2
  const svgWidth = 503
  const barWidth = 167
  const textPadding = 10
  let runningY = 0
  const numNonZero = gsniMetrics.filter(metric => +country[metric] !== 0).length
  const barPadding = 1
  const totalBarPadding = barPadding * (numNonZero - 1)
  const availableHeight = svgHeight - totalBarPadding
  const minBarHeight = 12
  let extraBarHeight = 0
  const gsniMetricSum = sum(gsniMetrics, metric => +country[metric])
  const allMetrics = ['Total', 'Men', 'Women'].concat(gsniMetrics)
  const rects = gsniMetrics.map(metric => {
    const value = country[metric]
    if (value === '' || value === '0') {
      return null
    }
    // console.log(metric, value)
    let rectHeight = availableHeight * (value / gsniMetricSum)
    if (rectHeight < minBarHeight) {
      extraBarHeight += minBarHeight - rectHeight
      rectHeight = minBarHeight
    }
    const rectY = runningY
    runningY += rectHeight + barPadding
    return (
      <g key={metric} transform={`translate(0, ${rectY})`}>
        <rect
          width={barWidth}
          height={rectHeight}
          fill={gsniColors[metric]}
        />
        <text
          x={barWidth + textPadding}
          dy='0.85em'
          fill={gsniColors[metric]}
          fontWeight='bold'
        >
          {metric}: {format(value, 'gsni')}%
        </text>

      </g>
    )
    })

  const metricMax = max(allMetrics, metric => +country[metric])
  const marginBottom = 20
  const marginTop = 10
  const marginLeft = 20
  const marginRight = 20
  const yScale = scaleLinear()
    .domain([0, 100])
    .range([svgHeight - marginBottom - marginTop, 0])
  // const yAxis = axisLeft(yScale)
  //   .tickFormat(d => format(d, 'gsni'))
  //   .tickSize(-svgWidth)
  //   .tickPadding(10)
  // const yAxisGroup = (
  //   <g className='yAxis' transform={`translate(${barWidth}, 0)`}>
  //     {yAxis}
  //   </g>
  // )
  const barWidth2 = (svgWidth - marginLeft - marginRight) / allMetrics.length / 2
  const positions = [
    barWidth2 * 0.2,
    barWidth2 + barWidth2 * 0.6,
    barWidth2 + barWidth2 + barWidth2 * 1,
    barWidth2 + barWidth2 + barWidth2 + barWidth2 * 2,
    barWidth2 + barWidth2 + barWidth2 + barWidth2 + barWidth2 * 2.8,
    barWidth2 + barWidth2 + barWidth2 + barWidth2 + barWidth2 + barWidth2 * 3.6,
    barWidth2 + barWidth2 + barWidth2 + barWidth2 + barWidth2 + barWidth2 + barWidth2 * 4.4,
  ]
  const barWidthGrowFactor = 1.3
  const barWidths = [
    barWidth2, barWidth2, barWidth2,
    barWidth2 * barWidthGrowFactor, barWidth2 * barWidthGrowFactor, barWidth2 * barWidthGrowFactor, barWidth2 * barWidthGrowFactor
  ]
  const rects2 = allMetrics.map((metric, i) => {
    const value = country[metric]
    const rectHeight = svgHeight - yScale(value) - marginTop - marginBottom
    const rectY = yScale(value)
    const rectX = positions[i] + marginLeft
    const fill = gsniColors[metric] || '#ccc'
    return (
      <g key={metric} transform={`translate(${rectX}, ${rectY})`}>
        <rect
          width={barWidths[i]}
          height={rectHeight}
          fill={fill}
        />
        <text
          x={barWidths[i] / 2}
          textAnchor='middle'
          y={rectHeight}
          dy='0.85em'
          fontSize='0.8em'
        >
          {metric.split(' ').map((word, wordIndex) => {
            return (
              <tspan
                key={word}
                x={barWidths[i] / 2}
                dy='1.1em'
              >
                {word}
              </tspan>
            )
          })}
        </text>
        <text
          x={barWidths[i] / 2}
          textAnchor='middle'
          dy='-0.5em'
          fontSize='0.8em'
        >
          {format(value, 'gsni')}%
        </text>
      </g>
    )
  })
  const offsetRight = 60
  const lines = [0, 20, 40, 60, 80, 100].map(value => {
    const y = yScale(value)
    return (
      <g key={value} transform={`translate(${marginLeft}, ${y})`}>
        <line
          x1={0}
          x2={svgWidth - marginLeft - marginRight - offsetRight}
          stroke='#ccc'
          strokeWidth={1}
        />
        <text
          x={0}
          textAnchor='end'
          dy='0.45em'
          fontSize='0.8em'
        >
          {value}%
        </text>
      </g>
    )
  })
  return (
    <div>
      <ChangeTooltipHeader {...props} formatKey='gsni' suffix='%' label='Percent of people with at least one bias'/>
      <hr />
      <svg width={svgWidth - offsetRight} height={svgHeight + extraBarHeight}>
        <g>

          {rects}

        </g>
      </svg>
      <hr />
      <div style={{ fontWeight: 'bold', marginBottom: '0.75em'}}>Bias percent breakdown by gender and dimension</div>
      <svg width={svgWidth} height={svgHeight }>
        <g transform={`translate(0, ${marginTop})`}>
          <g>{lines}</g>
          <g>{rects2}</g>
        </g>
      </svg>
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
        value={format(country[`rankdiff_hdi_phdi_2021`], 'rankdiff_hdi_phdi')}
      />
      <hr />
      <Stat
        label='Material footprint per capita (tonnes)'
        value={format(country[`mf_${year}`], 'co2_prod')}
        bottomBorder
      />
      <Stat
        label='Carbon dixoide per capita (production, tonnes)'
        value={format(country[`co2_prod_${year}`], 'mf')}
        bottomBorder
      />


    </div>
  )
}


function HDIIntroTooltip(props) {
  const {point, data} = props
  const country = point.hover[2].row
  const columns = getGraphColumnsForKey(data, 'hdi')
  const lastColumn = columns[columns.length - 1]
  const lastYear = getYearOfColumn(lastColumn)
  const style = {backgroundColor: hdiIntroColorScale(country[lastColumn]), color: '#fff'}
  return (
    <div style={style}>
      <div className='flex'
        style={{ fontWeight: 'bold', borderBottom: '1px solid #fff',
          justifyContent: 'space-between', alignItems: 'center'}}>
        <div className='countryName'>{country.Country}</div>
        <div>HDI rank: {country[`hdi_rank_${lastYear}`]}</div>
      </div>
      <div className='flex' style={{ marginTop: '0.5em'}}>
        <div style={{ width: '50%'}}>
          <div>
            Classification
          </div>
          <div style={{fontWeight: 'bold'}}>{country.hdicode}</div>
        </div>
        <div style={{ width: '50%'}}>
          <div>
            Developing region
          </div>
          <div style={{ fontWeight: 'bold'}}>
            {country.region === '' ? 'Not defined' : country.region}
          </div>
        </div>
      </div>
    </div>
  )
}
export default function TooltipWrapper(props) {
  const {point} = props
  const { unmount } = point
  // console.log(props)
  const [opacity, setOpacity] = useState(0)
  useEffect(() => {
    setOpacity(unmount ? 0 : 0.9)
  }, [unmount])

  return (
    <CountryTooltip {...props}  opacity={opacity} />
  )
}
function CountryTooltip(props) {
  const { point, index, graph, opacity, close } = props
  const mobile = useMedia('(hover: none) and (max-width: 767px)')
  const tooltipRef = useRef()
  useClickAway(tooltipRef, (e) => {
    if (mobile && close && e.touches) {
      close()
    }
  })

  let xOffset = 10
  let x = point.x + xOffset
  let y = point.y
  if (point.columnWidth) {
    x += point.columnWidth / 2
  }
  // console.log(props)
  const tooltipWidth = graph.type === 'hdiIntro' ? 274 : index.key === 'GSNI' ? 443 : 423
  // console.log(tooltipWidth)
  const scrollBarPadding = 80
  const flipX = point.clientX + tooltipWidth + scrollBarPadding > window.innerWidth
  const headerHeight = 112
  const clientY = point.clientY - headerHeight * 0.5
  const flipY = clientY < window.innerHeight / 3 ? 'bottom' : clientY <  2 * window.innerHeight / 3 ? 'middle' : 'top'
  if (flipX) {
    x = point.x - tooltipWidth - xOffset
    if (point.columnWidth) {
      x -= point.columnWidth / 2 + 5
    }
  }
  let flipYTransform = null
  switch(flipY) {
    case 'top':
      flipYTransform = `translateY(-100%)`
      break
    case 'middle':
      flipYTransform = `translateY(-50%)`
      break
    case 'bottom':
    default:
      flipYTransform = `translateY(0)`
      break
  }

  const style = {
    transform: `translate(${x}px, ${y}px) ${flipYTransform}`,
    opacity,
    transition: point.unmount ? 'opacity 0.3s ease-in-out' : null
  }
  if (mobile) {
    style.transform = `translate(0, ${y}px)`
  }
  let tooltipContents = null
  let className = null
  if (index && graph) {
    if (index.key === 'GDI'){
      tooltipContents = <GDIScatterTooltip {...props} />
    } else if (index.key === 'GII') {
      tooltipContents = <GIIScatterTooltip {...props} />
    } else if (index.key === 'IHDI') {
      tooltipContents = <IHDIDifferenceTooltip {...props} />
    } else if (index.key === 'HDI' && (graph.type === 'difference' || graph.type ==='index')) {
      tooltipContents = <HDIDifferenceTooltip {...props} />
    } else if (index.key === 'HDI' && graph.type === 'scatter') {
      tooltipContents = <HDIScatterTooltip {...props} />
    } else if (index.key === 'MPI') {
      tooltipContents = <MPIBarTooltip {...props} />
    } else if (index.key === 'PHDI') {
      tooltipContents = <PHDIBarTooltip {...props} />
    } else if (index.key === 'HDI' && graph.type === 'hdiIntro') {
      className = 'hdiIntroTooltip'
      tooltipContents = <HDIIntroTooltip {...props} />
    } else if (index.key === 'GSNI') {
      tooltipContents = <GSNIBarTooltip {...props} />
      className='gsniTooltip'
    }
  }
  if (!tooltipContents) {
    return null
  }
  return (
    <div ref={tooltipRef} className={classNames('CountryTooltip', className, { mobile })} style={style}>
      {tooltipContents}
    </div>
  )
}