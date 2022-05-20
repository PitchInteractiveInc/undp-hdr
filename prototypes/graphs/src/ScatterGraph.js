import { scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'
import './IndexGraph.scss'
import { comparisonColors } from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import GraphColorLegend from './GraphColorLegend';
import { Delaunay } from 'd3-delaunay';
import { useState, useRef, useEffect } from 'react';
import CountryTooltip from './CountryTooltip';
import hdiBackgroundRectData from './hdiBackgroundRectData';
import format from './format';
import getYearOfColumn from './getYearOfColumn';
import { scaleSqrt } from 'd3-scale';
import { arc } from 'd3-shape';
import HDILabels from './HDILabels';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from '@react-spring/web'
import { useMedia } from 'react-use';

const config = { mass: 1, tension: 210, friction: 20 }


function Circle(props) {
  const spring  = useSpring({
    to: {
      r: props.r,
    },
    // config,
  })
  if (props.printing) {
    return <circle {...props} />
  }
  return (
    <animated.circle
      opacity={props.opacity}
      r={spring.r}
      cx={props.cx}
      cy={props.cy}
      fill={props.fill}
    />
  )
}
export const colors = [
  '#d12816',
  '#ee402d',
  '#fbc42d',
  '#6de354',
  '#59ba47',
  '#60d4f2',
  '#21c1fc',
  '#6babeb',
  '#3288ce',
  '#006eb5',
]

function AnimatedDotAndLine(props) {
  const { data, inviewOnce, hoveredPoint, stroke, yScale, xScale, index, printing } = props
  const [pointsAnimated, setPointsAnimated] = useState(0)

  const lineGenerator = line()
    .x((d, i, data) => {
      // if (i > pointsAnimated) {
      //   return xScale(data[pointsAnimated].index + 0.5)
      // }
      return xScale(d.index + 0.5)
    })
    .y((d, i) => {
      // if (i > pointsAnimated) {
      //   let latestDataFound = null
      //   for (let i = pointsAnimated; i >= 0; i--) {
      //     const datum = data[i]
      //     if (datum.value != null) {
      //       latestDataFound = datum
      //       break
      //     }
      //   }
      //   if (latestDataFound) {
      //     return yScale(latestDataFound.value)
      //   } else {
      //     return 0
      //   }
      // }
      return yScale(d.value)
    })
    .defined(d => d.value != null)

  useEffect(() => {
    const id = setTimeout(() => {

      if (inviewOnce && pointsAnimated < data.length) {
        const delta = 1// Math.ceil(data.length / 10)
        setPointsAnimated(pointsAnimated + delta)
      }
    }, 16)
    return () => clearTimeout(id)

  }, [pointsAnimated, data.length, inviewOnce])
  const dots = []
  data.forEach((row, i) => {
    if (row.value == null) {
      return null
    }
    const dotX = lineGenerator.x()(row, i, data)
    const dotY = lineGenerator.y()(row, i, data)
    let opacity = null

    if (hoveredPoint) {
      if (/*hoveredPoint.hover[2].row === row.row &&*/ hoveredPoint.hover[2].col === row.col) {
        opacity = 1
      } else {
        if (hoveredPoint.hover[2].row === row.row) {
          opacity = 0.5
        } else {
          opacity = 0.3
        }
      }
    }
    const radius = window.innerWidth < 600 ? 2.5 : 6
    const r = i > pointsAnimated  && !printing ? 0 : radius
    dots.push(
      <Circle
        key={row.index}
        r={r}
        cx={dotX}
        cy={dotY}
        fill={stroke}
        opacity={opacity}
        printing={printing}
      />
    )
  })
  const clipPathId = `scatterClipPath-${index.key}-${data[0].row.ISO3}`
  const clipSpring = useSpring({
    to: {
      width: xScale(pointsAnimated)
    },
  })
  return (
    <>
        <clipPath id={clipPathId}>
          <animated.rect
            width={clipSpring.width}
            height={yScale.range()[0]}
          />
        </clipPath>
        <path clipPath={printing ? null :`url(#${clipPathId})`} opacity={hoveredPoint ? 0.5 : 1} d={lineGenerator(data)} stroke={stroke} fill='none' />
        <g>{dots}</g>
    </>
  )

}

export default function ScatterGraph(props) {
  let { data, country, index, selectedCountries, graph, width, height, missingCountries, printing } = props

  const dataKey = index.key
  const graphColumns = getGraphColumnsForKey(data, dataKey)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const [ref, inView] = useInView({ threshold: 0.5 })
  const [inviewOnce, setInviewOnce] = useState(false)
  useEffect(() => {
    if (inView && !inviewOnce) {
      setInviewOnce(true)
    }
  }, [inView, inviewOnce])



  // console.log(dataKey, data.columns)
  // console.log(graphColumns)

  const margins = { top: 10, right: 50, bottom: 20, left: 0 }
  width -= margins.left + margins.right
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom
  const showEveryOtherYLabel = width < 500
  // const saveSVG = (event) => {
  //   exportSVG(event.target.closest('svg'), `${selectedMetric['Full name']}.svg`)
  // }


  const yearExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  const yExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  data.forEach(country => {
    graphColumns.forEach(col => {
      const value = +country[col]
      if (country[col] !== '') {
        const year = +col.substr(col.lastIndexOf('_') + 1)
        yearExtent[0] = Math.min(yearExtent[0], year)
        yearExtent[1] = Math.max(yearExtent[1], year)
      }
      yExtent[0] = Math.min(yExtent[0], value)
      yExtent[1] = Math.max(yExtent[1], value)
    })
  })



  const xScale = scaleLinear()
    .domain([0, graphColumns.length])
    .range([0, width])

  const columnWidth = xScale(1)
  const yScale = scaleLinear()
    .domain(yExtent)
    .range([height, 0])
    .nice()

  const rowsToPlot = [
    { row: country, color: '#1F5A95' } ,

  ].filter(d => d.row)
  // console.log(rowsToPlot)

  selectedCountries.forEach((iso3, index) => {
    if (iso3) {
      const country = data.find(d => d.ISO3 === iso3)
      if (country) {
        rowsToPlot.push({ row: country, color: comparisonColors[index] })
      }
    }
  })

  const worldData = data.find(d => d.Country === 'World')
  if (worldData) {
    rowsToPlot.push({ row: worldData , color: '#55606F', })
  }
  const regionData = data.find(d => d.Country === country.region )
  if (regionData) {
    rowsToPlot.push({ row: regionData, color: '#A9B1B7'})
  }


  const delaunayData = []
  const lineData = rowsToPlot.map(row => {
    const dots = []
    const stroke = row.color
    let hoverLine = null
    const rowData = graphColumns.map((col, colIndex) => {
      const year = getYearOfColumn(col)
      if (row.row[col] === '') {
        return {
          index: colIndex,
          value: null,
          col,
          row: row.row,
        }
      }
      const value = +row.row[col]
      const dotX = xScale(colIndex + 0.5)
      const dotY = yScale(value)
      delaunayData.push([dotX, dotY, {row: row.row, col}])
      let opacity = null

      if (hoveredPoint) {
        if (/*hoveredPoint.hover[2].row === row.row &&*/ hoveredPoint.hover[2].col === col) {
          opacity = 1

          if (hoveredPoint.hover[2].row === row.row) {
            hoverLine = (
              <line
                x1={dotX} y1={0} x2={dotX} y2={height}
                stroke='#232E3E'
                strokeDasharray='4,4'
              />
            )
          }

        } else {
          if (hoveredPoint.hover[2].row === row.row) {
            opacity = 0.5
          } else {
            opacity = 0.3
          }
        }
      }
      // dots.push(
      //   <Circle
      //     opacity={opacity}
      //     r={6}
      //     key={year}
      //     cx={dotX}
      //     cy={dotY}
      //     fill={stroke}
      //   />
      // )
      return {
        index: colIndex,
        value,
        col,
        row: row.row,
      }
    })
    return (
      <g key={row.row.Country}>
        {hoverLine}
        <AnimatedDotAndLine
          data={rowData}
          stroke={stroke}
          hoveredPoint={hoveredPoint}
          yScale={yScale}
          xScale={xScale}
          inviewOnce={inviewOnce}
          index={index}
          printing={printing}
          // lineOpacity={hoveredPoint ? 0.5 : 1}
        />
        {/* <path opacity={hoveredPoint ? 0.5 : 1} d={lineGenerator(rowData)} stroke={stroke} fill='none'></path>
        <g>{dots}</g> */}
      </g>
    )
  })
  const delaunay = Delaunay.from(delaunayData)
  const isHDIGraph = index.key === 'HDI'
  const years = graphColumns.map((column, columnIndex) => {
    const year = +column.substr(column.lastIndexOf('_') + 1)

    const x = xScale(columnIndex + 0.5)
    const showYearLines = isHDIGraph
    const showYearRects = !isHDIGraph
    let everyOtherLabel = graphColumns.length > 20
    let labelModulo = showEveryOtherYLabel && everyOtherLabel ? 4 : 2
    everyOtherLabel |= showEveryOtherYLabel
    const nextYearConsecutive = (columnIndex < graphColumns.length - 1) && (+getYearOfColumn(graphColumns[columnIndex + 1]) === year + 1)
    const yearRectWidth = nextYearConsecutive ? xScale(1) : xScale(1) * 0.8
    return (
      <g key={year} transform={`translate(${x}, 0)`}>
        {showYearLines ?
          <line y1={height} stroke='#A9B1B7' strokeWidth={0.5} strokeDasharray='4,4' />
          : null }
        {showYearRects ?
          <rect
            width={yearRectWidth}
            x={-yearRectWidth / 2}
            height={height}
            fill={(columnIndex % 2 === 1 || !nextYearConsecutive) ? (nextYearConsecutive ? '#F6F7F7' : '#FCFCFC') : '#FCFCFC'}
          />
          : null }
        {!everyOtherLabel || columnIndex % labelModulo === 0  ?
          <text y={height} dy={'1em'} textAnchor='middle'>{year}</text>
          : null }
      </g>
    )
  })

  let yScaleTicks = null
  if (isHDIGraph) {
    yScaleTicks = hdiBackgroundRectData.map((backgroundRect, i) => {
      const y0 = yScale(backgroundRect.y0)
      const y1 = yScale(backgroundRect.y1)
      const height = Math.abs(y1 - y0)
      const y = Math.min(y0, y1)
      const fill = backgroundRect.fill
      return (
        <g key={i}>
          <rect width={width} y={y} fill={fill} height={height} key={i} opacity={backgroundRect.opacity} ></rect>
          <text y={y0} x={width} dy={'0.3em'} dx='0.5em'>{format(backgroundRect.y0)}</text>
          {i === hdiBackgroundRectData.length - 1 ? <text y={y1} x={width} dy='0.3em' dx='0.5em'>{format(backgroundRect.y1)}</text> : null}
        </g>
      )
    })
  } else {
    yScaleTicks = yScale.ticks(10).map((tick, index) => {
      const y = yScale(tick)
      return (
        <g key={tick} transform={`translate(${width}, ${y})`}>
          <text dx='0.5em' dy='0.3em'>{format(tick)}</text>
          <line x1={-width} x2={0} stroke='#A9B1B7' strokeDasharray='4,3' strokeWidth={0.5} />
        </g>
      )
    })
  }

  const svgRef = useRef()
  const mouseMove = (event) => {
    const svgPosition = svgRef.current.getBoundingClientRect()
    const mouseX = event.clientX - svgPosition.left
    const mouseY = event.clientY - svgPosition.top
    if (mouseX > width) {
      mouseLeave()
      return
    }
    const closestPointIndex = delaunay.find(mouseX - margins.left, mouseY - margins.top)
    // console.log(mouseX, mouseY)
    if (closestPointIndex !== -1 && !isNaN(closestPointIndex)) {
      // console.log(closestPointIndex)
      // console.log(delaunayData[closestPointIndex])
      const x = delaunayData[closestPointIndex][0]
      const y = delaunayData[closestPointIndex][1]
      const clientX = x + svgPosition.left
      setHoveredPoint({ x, y, hover: delaunayData[closestPointIndex], columnWidth, clientX, clientY: event.clientY })
    }
  }

  const mouseLeave = () => {
    if (hoveredPoint) {
      setHoveredPoint({... hoveredPoint, unmount: true })
    }
  }
  useEffect(() => {
    let id = null
    if (hoveredPoint && hoveredPoint.unmount) {
      id = setTimeout(() => {
        setHoveredPoint(null)
      }, 500)
    }
    return () => {
      clearTimeout(id)
    }
  }, [hoveredPoint])

  let tooltip = null
  if (hoveredPoint) {
    tooltip = (
      <CountryTooltip close={mouseLeave} point={hoveredPoint} index={index} data={data} allRows={rowsToPlot} graph={graph} />
    )
  }

  let hdiLabels = null
  if (isHDIGraph) {
    hdiLabels = <HDILabels width={width} />
  }
  const navigate = useNavigate()
  const mobile = useMedia('(hover: none) and (max-width: 767px)')

  const graphClick = (event) => {
    if (hoveredPoint && !mobile) {
      const clickedCountry = hoveredPoint.hover[2].row
      const iso3 = clickedCountry.ISO3
      if (country && iso3 && country.ISO3 !== iso3) {
        navigate(`/countries/${iso3}`, { replace: true })
      }
    }
  }
  const cursor = hoveredPoint && hoveredPoint.hover[2].row.ISO3 && hoveredPoint.hover[2].row.ISO3 !== country.ISO3 ? 'pointer' : 'default'
  return (
    <div className='ScatterGraph'>
      <GraphColorLegend rows={rowsToPlot} missingCountries={missingCountries} />
      {hdiLabels}
      <div className='svgContainer' ref={ref}>
        <svg style={{ cursor }} fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
          onMouseMove={mouseMove}
          onMouseEnter={mouseMove}
          onMouseLeave={mouseLeave}
          onClick={graphClick}
          ref={svgRef}>

          <g transform={`translate(${margins.left}, ${margins.top})`}>
            {isHDIGraph ?
              <>
                <g>{yScaleTicks}</g>
                <g>{years}</g>
              </>
              :
              <>
                <g>{years}</g>
                <g>{yScaleTicks}</g>
              </>
            }
            <g>
              <line x1={0} x2={width} y1={height} y2={height} stroke='#A9B1B7' strokeWidth={0.5} />
              <line x1={0} x2={width} y1={0} y2={0} stroke='#A9B1B7' strokeWidth={0.5} />

            </g>
            <g>{lineData}</g>
          </g>
        </svg>
        {tooltip}
      </div>
    </div>
  )
}
