
import { scaleLinear } from 'd3-scale'
import './IndexGraph.scss'
import { comparisonColors } from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import GraphColorLegend from './GraphColorLegend';
import { Delaunay } from 'd3-delaunay';
import { useState, useRef, useEffect } from 'react';
import CountryTooltip from './CountryTooltip';
import format from './format';
import getYearOfColumn from './getYearOfColumn';
import { line } from 'd3-shape';
import { useNavigate } from 'react-router-dom';
import { useMedia } from 'react-use';
import { useInView } from 'react-intersection-observer'
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
function DifferenceGraphMark(props) {
  const { x, markX, width, stroke, y, height, fill, previousMarkData, opacity, hoverLabel, hoverLine } = props
  let previousYearMarks = null
  if (previousMarkData) {
    previousYearMarks = (
      <g>
        <rect
          x={previousMarkData.markerX}
          width={previousMarkData.markerWidth}
          y={previousMarkData.markerY }
          height={previousMarkData.markerHeight}
          stroke={previousMarkData.markStroke}
          strokeDasharray={previousMarkData.markStrokeDasharray}
          fill='none'
        />
        <rect
          y={previousMarkData.differenceBarY}
          x={previousMarkData.differenceBarX}
          width={previousMarkData.differenceBarWidth}
          height={previousMarkData.differenceBarHeight}
          stroke={previousMarkData.differenceBarStroke}
          fill={previousMarkData.differenceBarStroke}
        />
      </g>
    )
  }
  return (
    <g transform={`translate(${x}, 0)`} opacity={opacity}>
      {hoverLine}
      <rect
        x={markX}
        width={width}
        stroke={stroke}
        y={y}
        height={height}
        fill={fill}
      />
      {previousYearMarks}
      {hoverLabel}
    </g>
  )
}
function DifferenceGraphSeries(props) {
  const { differenceData, inviewOnce, printing, connectingLineData, xScale, yScale }  = props
  const [pointsAnimated, setPointsAnimated] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => {

      if (inviewOnce && pointsAnimated < differenceData.length) {
        const delta = 1// Math.ceil(data.length / 10)
        setPointsAnimated(pointsAnimated + delta)
      }
    }, 16)
    return () => clearTimeout(id)

  }, [pointsAnimated, differenceData.length, inviewOnce])

  let connectingLine = null
  if (connectingLineData) {
    const lineGen = line()
      .x(d => xScale(d.index) + connectingLineData.markWidth / 2 + connectingLineData.markWidth * connectingLineData.rowIndex + connectingLineData.yearWidth * 0.1)
      .y(d => yScale(d.value) + connectingLineData.markHeight / 2 + 0.5)
    const path = lineGen(connectingLineData.data)

    connectingLine = <path
      key={`connecting-line-${connectingLineData.rowIndex}`}
      d={path}
      stroke={connectingLineData.stroke}
      strokeWidth={connectingLineData.markHeight }
      fill='none'
      opacity={0.5}
    />
  }
  return (
    <g>
      {differenceData.map((d, i) => {
        const opacity = i < pointsAnimated ? d.opacity : 0
         return (
          <DifferenceGraphMark
            key={i}
            printing={printing}
            {...d}
            opacity={opacity}

          />
        )
      })}
      {connectingLine}
    </g>
  )
}

export default function DifferenceGraph(props) {
  let { data, country, index, selectedCountries, graph, width, height, printing, missingCountries } = props
  const selectedCountry = country
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

  const hdiGraph = index.key === 'HDI'
  if (hdiGraph && ! printing) {
    height = 292
  }
  const ihdiGraph = index.key === 'IHDI'

  const margins = { top: 0, right: 50, bottom: 20, left: 0 }
  width -= margins.left + margins.right
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom
  const navigate = useNavigate()
  const showEveryOtherYLabel = width < 500
  // const saveSVG = (event) => {
  //   exportSVG(event.target.closest('svg'), `${selectedMetric['Full name']}.svg`)
  // }


  const yearExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  const yExtent = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  data.forEach(country => {
    if (hdiGraph && country !== selectedCountry) {
      return
    }
    graphColumns.forEach(col => {
      const value = +country[col]
      if (country[col] !== '') {
        const year = +col.substr(col.lastIndexOf('_') + 1)
        yearExtent[0] = Math.min(yearExtent[0], year)
        yearExtent[1] = Math.max(yearExtent[1], year)
        yExtent[0] = Math.min(yExtent[0], value)
        yExtent[1] = Math.max(yExtent[1], value)
      }
    })
  })

  if (!hdiGraph) {
    yExtent[0] = Math.min(0, yExtent[0])
    yExtent[1] = Math.max(1, yExtent[1])
  }
  const xScale = scaleLinear()
    .domain([0, graphColumns.length])
    .range([0, width])

  const yScale = scaleLinear()
    .domain(yExtent)
    .range([height, 0])

  if (hdiGraph) {
    yScale.nice()
  }

  // console.log(yExtent)

  const rowsToPlot = [
    { row: country, color: '#1F5A95' } ,
    // { row: data.find(d => d.Country === 'World'), color: '#55606F', },
    // { row: data.find(d => d.Country === country.region ), color: '#A9B1B7'}

  ].filter(d => d.row)
  selectedCountries.forEach((iso3, index) => {
    if (iso3) {
      const country = data.find(d => d.ISO3 === iso3)
      if (country) {
        rowsToPlot.push({ row: country, color: comparisonColors[index] })
      }
    }
  })
  // console.log(rowsToPlot)
  const yearWidth = xScale(1)
  const markWidth = (yearWidth * 0.8) / rowsToPlot.length
  const delaunayData = []
  const drawConnectingLines = rowsToPlot.length > 1
  const differenceData = rowsToPlot.map((row, rowIndex) => {
    const stroke = row.color
    const rowData = graphColumns.map((col, colIndex) => {
      if (row.row[col] === '') {
        return null
      }
      const value = +row.row[col]
      let prevValue = null
      if (ihdiGraph) {
        prevValue = +row.row[col.replace('i', '')]
      }
      return {
        index: colIndex,
        value,
        prevValue,
        col
      }
    }).filter(d => d);
    let markHeight = ihdiGraph ? 5 : 1

    let connectingLineData = null
    if (drawConnectingLines) {
      connectingLineData = {
        data: rowData,
        stroke,
        strokeWidth: markHeight,
        markWidth,
        rowIndex,
        yearWidth,
        stroke,
        markHeight,
      }
      // const lineGen = line()
      //   .x(d => xScale(d.index) + markWidth / 2 + markWidth * rowIndex + yearWidth * 0.1)
      //   .y(d => yScale(d.value) + markHeight / 2 + 0.5)
      // const path = lineGen(rowData)

      // connectingLine = <path
      //   key={`connecting-line-${rowIndex}`}
      //   d={path}
      //   stroke={stroke}
      //   strokeWidth={markHeight }
      //   fill='none'
      //   opacity={0.5}
      // />
    }
    const differenceMarkData = rowData.map((datum, datumIndex) => {
      const x = xScale(datum.index) + markWidth / 2 + markWidth * rowIndex + yearWidth * 0.1
      const y = yScale(datum.value)
      let previousYearMarks = null
      let previousIsMore = false
      let previousHeight = 0
      let prevY = y
      let previousMarkData = null
      if (datumIndex > 0 || datum.prevValue) {
        const prevValue = datum.prevValue || rowData[datumIndex - 1].value
        prevY = yScale(prevValue)
        previousIsMore = prevValue > datum.value
        const differenceColor = y < prevY ? '#88E51C' : '#F86969'
        previousHeight = Math.abs(y - prevY)
        previousMarkData = {
          markerX: -markWidth / 2 + 1,
          markerWidth: markWidth - 2,
          markerY: previousIsMore ? prevY - markHeight - (ihdiGraph ? 1 : 0): prevY + (ihdiGraph ? 1 : 0),
          markerHeight: markHeight,
          markStroke: stroke,
          markStrokeDasharray: ihdiGraph ? null : '3,3',
          differenceBarY: Math.min(y, prevY),
          differenceBarX: -markWidth / 2 + 1,
          differenceBarWidth: markWidth - 2,
          differenceBarHeight: previousHeight,
          differenceBarStroke: differenceColor,
          differenceBarFill: differenceColor,
        }
        // previousYearMarks = (
        //   <g>
        //     <rect
        //       x={-markWidth / 2 + 1}
        //       width={markWidth - 2}
        //       y={previousIsMore ? prevY - markHeight - (ihdiGraph ? 1 : 0): prevY + (ihdiGraph ? 1 : 0) }
        //       height={markHeight}
        //       stroke={stroke}
        //       strokeDasharray={ihdiGraph ? null : '3,3'}
        //       fill='none'
        //     />
        //     <rect
        //       y={Math.min(y, prevY)}
        //       x={-markWidth / 2 + 1}
        //       width={markWidth - 2}
        //       height={previousHeight}
        //       stroke={differenceColor}
        //       fill={differenceColor}
        //     />
        //   </g>
        // )
      }
      const delaunayY = rowsToPlot.length === 1 ? (height / 2) : ((y + prevY) / 2)
      delaunayData.push([x, delaunayY, {row: row.row, col: datum.col}])

      let opacity = null
      let hoverLabel = null
      let hoverLine = null
      if (hoveredPoint) {
        if (hoveredPoint.hover[2].row === row.row && hoveredPoint.hover[2].col === datum.col) {
          opacity = 1
          hoverLine = (
            <line
              y1={0}
              y2={height}
              stroke='#232E3E'
              strokeDasharray='4,4'
            />
          )
        } else {
          opacity = 0.3
        }
        if (index.key === 'IHDI' && hoveredPoint.hover[2].col === datum.col) {
          const year = getYearOfColumn(datum.col)
          hoverLabel = (
            <g transform={`translate(0, ${Math.min(y, prevY) + previousHeight + markHeight})`}>
              <text fontWeight={'600'} fill={stroke} textAnchor='middle' dy='1em' >
                {format(datum.value)}
              </text>
              <text fontWeight='600' fill='#D12800' textAnchor='middle' dy='2em' >
                {format(row.row[`loss_${year}`], 'loss')}% loss
              </text>
            </g>
          )
        }
      }
      return {
        x,
        markX: -markWidth / 2 + 1,
        width: markWidth - 2,
        stroke: stroke,
        y: previousIsMore ? y : y-markHeight,
        height: markHeight,
        fill: ihdiGraph ? stroke : 'none',
        previousMarkData,
        hoveredPoint,
        opacity,
        hoverLabel,
        hoverLine,
      }
      // return (
      //   <g key={datumIndex} transform={`translate(${x}, 0)`} opacity={opacity}>
      //     {hoverLine}
      //     <rect
      //       x={-markWidth / 2 + 1}
      //       width={markWidth - 2}
      //       stroke={stroke}
      //       y={previousIsMore ? y : y - markHeight}
      //       height={markHeight}
      //       fill={ihdiGraph ? stroke : 'none'}
      //     />
      //     {previousYearMarks}
      //     {hoverLabel}
      //   </g>
      // )
    })
    return (
      <DifferenceGraphSeries
        key={row.row.Country}
        differenceData={differenceMarkData}
        connectingLineData={connectingLineData}
        inviewOnce={inviewOnce}
        printing={printing}
        xScale={xScale}
        yScale={yScale}
      />
    )
    // return (
    //   <g key={row.row.Country}>
    //     {differenceMarks}
    //     {connectingLine}
    //   </g>
    // )
  })
  const delaunay = Delaunay.from(delaunayData)

  const years = graphColumns.map((column, columnIndex) => {
    const year = +column.substr(column.lastIndexOf('_') + 1)

    const x = xScale(columnIndex + 0.5)
    const showYearLines = false
    const showYearRects = true
    let everyOtherLabel = graphColumns.length > 20
    let labelModulo = showEveryOtherYLabel && everyOtherLabel ? 4 : 2
    everyOtherLabel |= showEveryOtherYLabel
    return (
      <g key={year} transform={`translate(${x}, 0)`}>
        {showYearLines ?
          <line y1={height} stroke='#A9B1B7' strokeWidth={0.5} strokeDasharray='4,4' />
          : null }
        {showYearRects ?
          <rect
            width={xScale(1)}
            x={-xScale(1) / 2}
            height={height}
            fill={columnIndex % 2 === 0 ? '#F6F7F7' : '#fcfcfc'}
          />
          : null }
        {!everyOtherLabel || columnIndex % labelModulo === 0  ?
          <text y={height} dy={'1em'} textAnchor='middle'>{year}</text>
          : null }
      </g>
    )
  })

  const tickCount = hdiGraph ? 3 : 10
  const strokeDasharray = hdiGraph ? null : '4,3'
  const yScaleTicks = yScale.ticks(tickCount).map((tick, index) => {
    const y = yScale(tick)
    return (
      <g key={tick} transform={`translate(${width}, ${y})`}>
        <text dx='0.5em' dy='0.3em'>{format(tick)}</text>
        <line x1={-width} x2={0} stroke='#A9B1B7' strokeDasharray={strokeDasharray} strokeWidth={0.5} />
      </g>
    )
  })


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
    if (closestPointIndex !== -1 && !isNaN(closestPointIndex)) {
      const x = delaunayData[closestPointIndex][0]
      const clientX = x + svgPosition.left
      // console.log('set hovered point difference')
      setHoveredPoint({ x, y: mouseY, hover: delaunayData[closestPointIndex], columnWidth: yearWidth, clientX, clientY: event.clientY })
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

  let legend = <GraphColorLegend key='color' rows={rowsToPlot} missingCountries={missingCountries} />
  if (hdiGraph) {
    const legendStyle = {}
    const svgStyle = { overflow: 'visible '}
    let legendWidth = null
    if (printing || width < 600) {
      legendWidth = 760
      svgStyle.width = 760
      legendStyle.transform = 'scale(0.65)'
    }
    if (window.innerWidth > 600) {
      legend = (
        <svg  style={svgStyle} width={legendWidth} height="21" xmlns="http://www.w3.org/2000/svg" >
          <g style={legendStyle} transform="translate(-175)">
            <text id="current_year" data-name="current year" transform="translate(217.292)" fill="#232e3e"><tspan x="0" y="15">Current year</tspan></text>
            <text id="previous_year" data-name="previous year" transform="translate(359.588)" fill="#232e3e"><tspan x="0" y="15">Previous year</tspan></text>
            <text id="increase" transform="translate(511.5 1)" fill="#232e3e"><tspan x="0" y="15">Increase</tspan></text>
            <text id="decrease" transform="translate(631.5 1)" fill="#232e3e"><tspan x="0" y="15">Decrease</tspan></text>
            <line id="Line_11034" data-name="Line 11034" x2="30" transform="translate(175.5 11.5)" fill="none" stroke="#1f5a95" strokeWidth="3"/>
            <line id="Line_11035" data-name="Line 11035" x2="30" transform="translate(318 11.5)" fill="none" stroke="#1f5a95" strokeWidth="3" strokeDasharray="5" opacity="0.5"/>
            <rect id="Rectangle_23495" data-name="Rectangle 23495" width="25" height="4.5" transform="translate(478.066 10)" fill="#88e51c"/>
            <rect id="Rectangle_23496" data-name="Rectangle 23496" width="25" height="5" transform="translate(593 10)" fill="#F86969"/>
            <path id="Polygon_918" data-name="Polygon 918" d="M4,0,8,4H0Z" transform="translate(588 14) rotate(180)" fill="#F86969"/>
            <path id="Polygon_919" data-name="Polygon 919" d="M4,0,8,4H0Z" transform="translate(465.934 10)" fill="#88e51c"/>
          </g>
        </svg>
      )
    } else {
      legend = (
        <svg xmlns="http://www.w3.org/2000/svg" width="311.596" height="38.419" viewBox="0 0 311.596 38.419" fontFamily='proxima-nova, "Proxima Nova", sans-serif' fontSize='14' >
          <text id="current_year" data-name="current year" transform="translate(64.132)" fill="#232e3e" ><tspan x="0" y="13">Current year</tspan></text>
          <line id="Line_11768" data-name="Line 11768" x2="55" transform="translate(0 8.5)" fill="none" stroke="#1f5a95" strokeWidth="3"/>
          <line id="Line_11769" data-name="Line 11769" x2="55" transform="translate(151.464 8.5)" fill="none" stroke="#1f5a95" strokeWidth="3" strokeDasharray="1.5" opacity="0.5"/>
          <text id="previous_year" data-name="previous year" transform="translate(214.596)" fill="#232e3e" ><tspan x="0" y="13">Previous year</tspan></text>
          <text id="increase" transform="translate(64.132 21.419)" fill="#232e3e" ><tspan x="0" y="13">Increase</tspan></text>
          <text id="decrease" transform="translate(214.596 21.419)" fill="#232e3e" ><tspan x="0" y="13">Decrease</tspan></text>
          <rect id="Rectangle_25583" data-name="Rectangle 25583" width="42.322" height="5" transform="translate(164.142 30.419)" fill="#f86969"/>
          <path id="Polygon_1089" data-name="Polygon 1089" d="M4,0,8,4H0Z" transform="translate(159.142 34.419) rotate(180)" fill="#f86969"/>
          <rect id="Rectangle_25582" data-name="Rectangle 25582" width="42.868" height="4.5" transform="translate(12.132 30.419)" fill="#88e51c"/>
          <path id="Polygon_1090" data-name="Polygon 1090" d="M4,0,8,4H0Z" transform="translate(0 30.419)" fill="#88e51c"/>
        </svg>


      )
    }
  } else if (ihdiGraph) {
    const legendStyle = {}
    if (printing || width < 600) {
      legendStyle.transform = 'scale(0.65)'
    }
    let legend2 = null
    if (window.innerWidth > 600) {
      legend2 = (
        <svg style={{ overflow: 'visible '}} key='additional' xmlns="http://www.w3.org/2000/svg" width="475" height="21" viewBox="0 0 475 21" fontFamily='proxima-nova, "Proxima Nova", sans-serif'>
          <g style={legendStyle} transform="translate(-41)">
            <text id="IHDI_of_the_year" data-name="IHDI of the year" transform="translate(70 1)" fill="#232e3e" fontWeight="600"><tspan x="0" y="15">IHDI of the year</tspan></text>
            <text id="HDI_of_the_year" data-name="HDI of the year" transform="translate(221 1)" fill="#232e3e" fontWeight="600"><tspan x="0" y="15">HDI of the year</tspan></text>
            <text id="Loss" transform="translate(368 1)" fill="#232e3e" fontWeight="600"><tspan x="0" y="15">Loss</tspan></text>
            <text id="Loss" transform="translate(440 1)" fill="#232e3e" fontWeight="600"><tspan x="0" y="15">Gain</tspan></text>
            <g id="Rectangle_24182" data-name="Rectangle 24182" transform="translate(41 8.053)" stroke="#000" strokeWidth="0.5">
              <rect width="22" height="5" stroke="none"/>
              <rect x="0.25" y="0.25" width="21.5" height="4.5" fill="none"/>
            </g>
            <g id="Rectangle_24183" data-name="Rectangle 24183" transform="translate(192 8.053)" fill="none" stroke="#000" strokeWidth="0.5">
              <rect width="22" height="5" stroke="none"/>
              <rect x="0.25" y="0.25" width="21.5" height="4.5" fill="none"/>
            </g>
            <g id="Rectangle_24184" data-name="Rectangle 24184" transform="translate(339 8.053)" fill="#F86969" stroke="#ffe17e" strokeWidth="0.5">
              <rect width="22" height="5" stroke="none"/>
              <rect x="0.25" y="0.25" width="21.5" height="4.5" fill="none"/>
            </g>
            <g id="Rectangle_24184" data-name="Rectangle 24184" transform="translate(410 8.053)" fill="#88E51C" stroke="#ffe17e" strokeWidth="0.5">
              <rect width="22" height="5" stroke="none"/>
              <rect x="0.25" y="0.25" width="21.5" height="4.5" fill="none"/>
            </g>
          </g>
        </svg>

      )
    } else {
      legend2 = (
        <svg key='additional2' xmlns="http://www.w3.org/2000/svg" width="299" height="17" viewBox="0 0 299 17" fontFamily='proxima-nova, "Proxima Nova", sans-serif' fontWeight="600">
          <text id="IHDI_of_the_year" data-name="IHDI of the year" transform="translate(18)" fill="#232e3e" ><tspan x="0" y="13">IHDI of the year</tspan></text>
          <text id="HDI_of_the_year" data-name="HDI of the year" transform="translate(142)" fill="#232e3e" ><tspan x="0" y="13">HDI of the year</tspan></text>
          <g id="Rectangle_24182" data-name="Rectangle 24182" transform="translate(0 6)" stroke="#000" strokeWidth="0.5">
            <rect width="15" height="5" stroke="none"/>
            <rect x="0.25" y="0.25" width="14.5" height="4.5" fill="none"/>
          </g>
          <g id="Rectangle_24183" data-name="Rectangle 24183" transform="translate(124 6)" fill="none" stroke="#000" strokeWidth="0.5">
            <rect width="15" height="5" stroke="none"/>
            <rect x="0.25" y="0.25" width="14.5" height="4.5" fill="none"/>
          </g>
          <g id="Rectangle_24184" data-name="Rectangle 24184" transform="translate(244 6)" fill="#f86969" stroke="#ffe17e" strokeWidth="0.5">
            <rect width="15" height="5" stroke="none"/>
            <rect x="0.25" y="0.25" width="14.5" height="4.5" fill="none"/>
          </g>
          <text id="Loss" transform="translate(262)" fill="#232e3e" ><tspan x="0" y="13">Loss</tspan></text>
        </svg>

      )
    }
    legend = [legend, legend2]
  }
  const mobile = useMedia('(hover: none) and (max-width: 767px)')

  const clickGraph = () => {
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
    <div className='DifferenceGraph'>
      <div className='differenceLegend'>{legend}</div>

      <div className='svgContainer' ref={ref}>
        <svg style={{ cursor }} fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
          onMouseMove={mouseMove}
          onMouseEnter={mouseMove}
          onMouseLeave={mouseLeave}
          onClick={clickGraph}
          ref={svgRef}>


          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <g>{years}</g>
            <g>{yScaleTicks}</g>
            <g>
              <line x1={0} x2={width} y1={height} y2={height} stroke='#A9B1B7' strokeWidth={0.5} />
              <line x1={0} x2={width} y1={0} y2={0} stroke='#A9B1B7' strokeWidth={0.5} />
            </g>
            <g>{differenceData}</g>
          </g>
        </svg>
        {tooltip}
      </div>
    </div>
  )
}
