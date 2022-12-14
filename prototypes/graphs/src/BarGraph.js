
import { scaleLinear } from 'd3-scale'
import './IndexGraph.scss'
import { comparisonColors } from './ComparisonCountrySelectors';
import getGraphColumnsForKey from './getGraphColumnsForKey';
import GraphColorLegend from './GraphColorLegend';

import { Delaunay } from 'd3-delaunay';
import { useState, useRef, useEffect } from 'react';
import CountryTooltip from './CountryTooltip';
import format from './format';
import { useNavigate } from 'react-router-dom';

import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from '@react-spring/web'
import { useMedia } from 'react-use';
function Rect(props) {
  const rectSpring = useSpring({
    to: {
      y: props.y,
      height: props.height,
    },
    delay: props.index * 10,
  })
  if (props.printing) {
    return <rect {...props} />
  }

  return (
    <animated.rect
      width={props.width}
      fill={props.fill}
      stroke={props.stroke}
      y={rectSpring.y}
      height={rectSpring.height}
    />
  )
}
export default function BarGraph(props) {
  let { data, country, index, selectedCountries, graph, width, height, missingCountries } = props
  const selectedCountry = country
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const [ref, inView] = useInView({ threshold: 0.5 })

  const [inviewOnce, setInviewOnce] = useState(false)
  useEffect(() => {
    if (inView && !inviewOnce) {
      setInviewOnce(true)
    }
  }, [inView, inviewOnce])

  const dataKey = index.key
  let graphColumns = getGraphColumnsForKey(data, dataKey)
  let hdiGraphColumns = getGraphColumnsForKey(data, 'HDI') // use these for a custom PHDI sort order

  graphColumns = [graphColumns[graphColumns.length - 1]]
  hdiGraphColumns = [hdiGraphColumns[hdiGraphColumns.length - 1]]

  // console.log(dataKey, data.columns)
  // console.log(graphColumns)
  const filteredData = data.filter(d => d[graphColumns[0]] !== ''
    && (d.ISO3 !== '' || d.Country === 'World'))
  // console.log(filteredData)

  const margins = { top: 10, right: 50, bottom: 20, left: 0 }
  width -= margins.left + margins.right
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom


  const xScale = scaleLinear()
    .domain([0, filteredData.length])
    .range([0, width])

  const columnWidth = xScale(1)

  const yMin = Math.min(...filteredData.map(d => +d[graphColumns[0]]))
  const yMax = Math.max(...filteredData.map(d => +d[graphColumns[0]]))
  const yExtent = [yMin, yMax]
  const yScale = scaleLinear()
    .domain(yExtent)
    .range([0, height])
    .nice()
  const sortedData = [...filteredData]
  sortedData.sort((a, b) => {
    let aValue = a[graphColumns[0]]
    let bValue = b[graphColumns[0]]
    if (index.key === 'PHDI') {
      aValue = a[hdiGraphColumns[0]]
      bValue = b[hdiGraphColumns[0]]
    }
    return index.key === 'MPI' ? bValue - aValue : aValue - bValue
  })

  const barWidth = width / sortedData.length * 0.8
  const legendRows = [
  ]
  if (selectedCountry && data.includes(selectedCountry)) {
    legendRows.push({ row: selectedCountry, color: '#1F5A95' })
  }

  selectedCountries.forEach((iso3, index) => {
    if (iso3 !== '') {
      const country = filteredData.find(d => d.ISO3 === iso3)
      if (country) {
        legendRows.push({ row: country, color: comparisonColors[index] })
      }
    }
  })
  const worldData = data.find(d => d.Country === 'World')
  if (worldData) {
    legendRows.push({ row: worldData, color: '#000', })

  }
  const delaunayData = []
  const labels = []
  const bars = sortedData.map((country, i) => {
    const value = +country[graphColumns[0]]
    const x = xScale(i)
    const y = inviewOnce || props.printing ?  yScale(value) : 0
    let fill = '#EDEFF0'
    let showLabel = false
    if (selectedCountry && country.Country === selectedCountry.Country) {
      fill = '#1F5A95'
      showLabel = true
    } else if (country.Country === 'World') {
      fill = '#000'
      showLabel = true
    } else if (selectedCountries.length > 0) {
      const selectedCountryIndex = selectedCountries.findIndex(d => d === country.ISO3)
      if (selectedCountryIndex !== -1) {
        showLabel = true
        fill = comparisonColors[selectedCountryIndex]
      }
    }
    delaunayData.push([x, height / 2, {row: country, col: graphColumns[0]}])

    let labelFill = fill
    let stroke = null
    if (hoveredPoint && !hoveredPoint.unmount) {
      if (hoveredPoint.hover[2].row === country && fill === '#EDEFF0') {
        stroke = '#000'
        fill = 'none'
        labelFill = stroke
        showLabel = true
      }
    }
    let label = showLabel ? <text x={x} key={i} dy='-0.5em' textAnchor='middle' fill={labelFill} y={height - y}>{format(value)}</text> : null
    labels.push(label)
    return (
      <g transform={`translate(${x}, ${0})`} key={i}>
        <Rect
          width={barWidth}
          y={height - y}
          height={y}
          fill={fill}
          stroke={stroke}
          index={i}
          printing={props.printing}
        />
      </g>
    )
  })
  const delaunay = Delaunay.from(delaunayData)

  // const saveSVG = (event) => {
  //   exportSVG(event.target.closest('svg'), `${selectedMetric['Full name']}.svg`)
  // }



  const yScaleTicks = yScale.ticks(10).map((tick, index) => {
    const y = yScale(tick)
    return (
      <g key={tick} transform={`translate(${width}, ${height - y})`}>
        <text dy='0.3em' dx='0.5em'>{format(tick)}</text>
        {/* <line x1={-width - xScale(0.5)} x2={-xScale(0.5)} stroke='#A9B1B7' strokeDasharray='4,3' strokeWidth={0.5} /> */}
      </g>
    )
  })

  const svgRef = useRef()
  const mouseMove = (event) => {
    const svgPosition = svgRef.current.getBoundingClientRect()
    const mouseX = event.clientX - svgPosition.left
    const mouseY = event.clientY - svgPosition.top
    const closestPointIndex = delaunay.find(mouseX - margins.left, mouseY - margins.top)
    if (closestPointIndex !== -1 && !isNaN(closestPointIndex)) {
      const x = delaunayData[closestPointIndex][0] + barWidth / 2
      const clientX = x + svgPosition.left
      setHoveredPoint({ x, y: mouseY, hover: delaunayData[closestPointIndex], columnWidth: Math.max(30, columnWidth), clientX, clientY: event.clientY })
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
      <CountryTooltip point={hoveredPoint} index={index} data={data} graph={graph} close={mouseLeave} />
    )
  }

  const navigate = useNavigate()
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
    <div className='BarGraph'>
      <GraphColorLegend rows={legendRows} missingCountries={missingCountries} />
      <div className='svgContainer' ref={ref}>
        <svg style={{ cursor }} fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
          onMouseMove={mouseMove}
          onMouseEnter={mouseMove}
          onMouseLeave={mouseLeave}
          onClick={clickGraph}
          ref={svgRef}>

          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <rect
              fill='#FAFAFA'
              width={width}
              height={height}
            />
            {/* <g>{years}</g> */}
            <g>
              <line x1={width} x2={width} y1={0} y2={height} stroke='#A9B1B7' />
              {yScaleTicks}
            </g>
            <g>{bars}</g>
            <g>{labels}</g>
            <text y={height} dy='1em' fontWeight='600'>Countries</text>
          </g>
        </svg>
        {tooltip}
      </div>
    </div>
  )
}
