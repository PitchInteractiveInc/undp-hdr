import { useState, useRef, useMemo, useEffect } from 'react'
import useGSNIData from "./useGSNIData";
import { range, max, mean, sum } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import exportSVG from './exportSVG';
import ComparisonCountrySelectors from './ComparisonCountrySelectors';
import { Delaunay } from 'd3-delaunay';
import CountryTooltip from './CountryTooltip';
import format from './format';
import { useWindowSize } from 'react-use';
import Dropdown from './Dropdown';
import { useSpring, animated } from 'react-spring';
export const gsniColors = {
  'Political': '#26830E',
  'Educational': '#33AF13',
  'Economic': '#85CF71',
  'Physical integrity': '#AEDFA1',
  // 'Cooking fuel': '#',
  // 'Housing': '#94c4f5',
  // 'Sanitation': '#',
  // 'Electricity': '#a9b1b7',
  // 'Drinking water': '#55606f',
  // 'Assets': '#232E3E'
}
const allMetrics = ['Total', 'Men', 'Women'].map(d => ({ key: d, type: 'index'}))
  .concat(Object.keys(gsniColors).map(d => ({ key: d, type: 'subgroup' })))

const metrics = Object.keys(gsniColors)
export default function GSNIGraphWrapper(props) {
  const gsniData = useGSNIData()
  if (!gsniData) {
    return null
  }
  return  <>
    <GSNIGraph {...props} gsniData={gsniData} />
    {/* <GSNIGraph2 {...props} gsniData={gsniData} windowHeight />
    <GSNIGraph2 {...props} gsniData={gsniData} /> */}
  </>
}

function AnimatedRect(props) {
  const { width, height, y, fill, opacity } = props
  const rectSpring = useSpring({
    to: {
      y,
      height,
    }
  })
  return (
    <animated.rect
      width={width}
      height={rectSpring.height}
      y={rectSpring.y}
      fill={fill}
      opacity={opacity}
    />
  )
}

function GSNIGraph(props) {
  const { index, gsniData } = props
  const [selectedCountries, setSelectedCountries] = useState([])
  const svgRef = useRef()
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [hoveredMetric, setHoveredMetric] = useState(null)
  const countSelectedCountries = selectedCountries.filter(d => d !== '').length

  const [selectedGSNIKey, setSelectedGSNIKey] = useState('Total')
  const selectedGSNIKeyType = allMetrics.find(d => d.key === selectedGSNIKey).type
  const countries = gsniData.filter(d => d.ISO3 !== '' && d[selectedGSNIKey] !== '')
  const sortedCountries = [...countries]
  // console.log(countries)
  sortedCountries.sort((a, b) => a.Country.localeCompare(b.Country))

  const windowSize = useWindowSize()
  const maxBlockSize = 1392
  const windowWidth = Math.min(maxBlockSize, windowSize.width) - 32 - 20
  let width = windowWidth
  let height = Math.max(windowSize.height * 0.65, 200)
  const margins = { top: 20, right: 0, bottom: 10, left: 50 }
  width -= margins.left + margins.right
  height -= margins.top + margins.bottom
  const rowWidth = width / sortedCountries.length
  const barWidth = rowWidth - 2
  const svgWidth = width + margins.left + margins.right
  const svgHeight = height + margins.top + margins.bottom
  // console.log(gsniData)
  // return null

  let countryDropdowns = <ComparisonCountrySelectors
    selectedCountries={selectedCountries}
    setSelectedCountries={setSelectedCountries}
    countries={countries}
    hideSync={true}
    maxSelectable={3}
    colorByIndexValue={true}
  />

  const yMax = 100 // max(countries, d => d[selectedGSNIKey])
  // console.log(yMax)
  const yScale = scaleLinear()
    .domain([0, yMax])
    .range([0, height])

  const delaunayData = []
  const averages = useMemo(() => {
    const averages = {}
    metrics.forEach(metric => {
      averages[metric]  = 1
    })
    return averages
  }, [countries])
  const metricsToUse = selectedGSNIKeyType === 'index' ? metrics : metrics.filter(d => d === selectedGSNIKey)

  const countryBars = sortedCountries.map((country, countryIndex) => {
    const totalBarHeight = yScale(country[selectedGSNIKey])

    let runningY = height
    let opacity = null
    const hasSelection = countSelectedCountries > 0
    const isSelected = hasSelection && selectedCountries.includes(country.ISO3)

    if (hoveredPoint) {
      if (hoveredPoint.hover[2].row === country) {
        opacity = 1
      } else {
        opacity = 0.2
      }
    }
    const metricTotalSum = sum(metricsToUse, metric => country[metric])

    const metricBars = metrics.map(metric => {
      const y = runningY
      let metricPercentage = country[metric]
      if (selectedGSNIKeyType === 'subgroup' && metric !== selectedGSNIKey) {
        metricPercentage = 0
      }
      const rectHeight = totalBarHeight * (metricPercentage / metricTotalSum)
      runningY -= rectHeight
      let barOpacity = 1
      if (hoveredMetric) {
        barOpacity = hoveredMetric === metric ? 1 : 0.2
      }
      return (
        <AnimatedRect
          key={metric}
          width={barWidth}
          height={rectHeight}
          y={y - rectHeight}
          fill={gsniColors[metric]}
          opacity={barOpacity}
        />
      )
    })
    const x = countryIndex * rowWidth
    delaunayData.push([x, height / 2, {row: country, col: selectedGSNIKey}])
    let label = null
    if (isSelected) {
      label = (
        <g transform={`translate(${barWidth / 2}, ${runningY - 5})`}>
          <circle cx={0} cy={0} r={2} fill={'black'} />
          <text fontWeight='600' x={-2} y={-6} fill="black">{country.Country} {format(country[selectedGSNIKey], 'gsni')}</text>
        </g>
      )
    }
    return <g opacity={opacity} key={country.ISO3} transform={`translate(${x}, 0)`}>
      {/* <rect x={0}
        width={width} height={barHeight}
        fill={'black'}
      /> */}
      {metricBars}
      {label}
    </g>
  })
  const delaunay = Delaunay.from(delaunayData)
  const yTickArray = yScale.ticks()
  const tickHeight = height / (yTickArray.length - 1)
  const yTicks = yTickArray.map((tick, tickIndex) => {
    const y = height - yScale(tick)

    return <g key={tick} transform={`translate(0, ${y})`}>
      {tickIndex % 2 !== 0 ?
        <rect width={width} height={tickHeight} fill={'#F7F7F7'} />
      : null }
      <text x={-10} y={0} dy={4} textAnchor={'end'}>{format(tick, 'gsni')}</text>
    </g>
  })
  const [exporting, setExporting] = useState(false)

  const rightClick = (e) => {
    //export svg
    const svg = svgRef.current
    setHoveredPoint(null)
    setExporting(true)
    e.preventDefault()
  }
  useEffect(() => {
    if (exporting) {
      const ref = svgRef.current
      exportSVG(ref, 'GSNIGraph.svg')
      setExporting(false)
    }
  }, [exporting])
  const mouseMove = (event) => {
    const svgPosition = svgRef.current.getBoundingClientRect()
    const mouseX = event.clientX - svgPosition.left
    const mouseY = event.clientY - svgPosition.top
    const closestPointIndex = delaunay.find(mouseX - margins.left, mouseY - margins.top)
    // console.log(mouseX, mouseY)
    if (closestPointIndex !== -1 && !isNaN(closestPointIndex)) {
      // console.log(closestPointIndex)
      // console.log(delaunayData[closestPointIndex])
      const x = delaunayData[closestPointIndex][0] + margins.left
      const y = mouseY
      const clientX = x + svgPosition.left
      setHoveredPoint({ x, y, hover: delaunayData[closestPointIndex], columnWidth: rowWidth * 2, clientX, clientY: event.clientY })
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
    const graph = {
      type: 'index'
    }
    tooltip = (
      <CountryTooltip close={mouseLeave} point={hoveredPoint} index={index} data={gsniData} allRows={[]} graph={graph} />
    )
  }

  const metricGraphHeight = 40
  const metricGraphBarHeight = 20

  const metricGraphSum = sum(metrics, metric => averages[metric])
  const metricGraphBarPadding = 5
  const metricGraphBarTotalPadding = metricGraphBarPadding * (metrics.length - 1)
  const metricGraphBarWidth = svgWidth - metricGraphBarTotalPadding
  const metricGraphXScale = scaleLinear()
    .domain([0, metricGraphSum])
    .range([0, metricGraphBarWidth])

  let runningX = 0
  const hoverMetric = (metric) => () => {
    setHoveredMetric(metric)
  }
  const masks = []
  const metricGraphBars = metrics.map((metric, metricIndex) => {
    const value = averages[metric]
    const barWidth = metricGraphXScale(value)
    const x = runningX
    runningX += barWidth + metricGraphBarPadding
    const maskId = `gsniMask${metricIndex}`
    masks.push(
      <clipPath id={maskId} key={metricIndex} >
        <rect key={metric} x={x} y={0} width={barWidth} height={metricGraphHeight} fill='#333' />
      </clipPath>
    )
    const textOpacity = !hoveredMetric || (hoveredMetric === metric) ? 1 : 0
    const clipPathId = hoveredMetric && (hoveredMetric === metric) ? null : `url(#${maskId})`
    return (
      <g key={metric} clipPath={clipPathId}>
        <g transform={`translate(${x}, 10)`}  onMouseOver={hoverMetric(metric)} onMouseOut={hoverMetric(null)}>

          <text style={{ transition: 'opacity 0.3s ease-in-out', opacity: textOpacity}} fontSize='0.8em' fontWeight='600' dy={'-0.2em'}>{metric}</text>

          <rect width={barWidth} height={metricGraphBarHeight} fill={gsniColors[metric]} />
        </g>
      </g>
    )
  })
  return (
    <div className='IndexGraph'>
      <div>
        {countryDropdowns}
      </div>
      <div>
        <Dropdown
          values={allMetrics}
          value={selectedGSNIKey}
          setSelected={setSelectedGSNIKey}
          valueAccessor={d => d.key}
          labelAccessor={d => d.key}
          label='Select GSNI Index'
          optGroupAccessor={d => d.type}
          optGroupLabels={{
            'index': 'GSNI Index',
            'subgroup': 'GSNI Subgroup',
          }}
        />
      </div>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5em'}}>
        {selectedGSNIKeyType === 'index' ?
          `Percent of ${selectedGSNIKey === 'Total' ? 'people' : (selectedGSNIKey === 'Male' ? 'Men' : 'Women')} with at least one bias, total and by dimension`
          : `Percent of people with a bias in ${selectedGSNIKey} factors`
        }
      </div>
      <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={metricGraphHeight}>
        <defs>
          {masks}
        </defs>

        {metricGraphBars}
      </svg>
      <div style={{ marginLeft: margins.left}}>
        <span style={{ fontWeight: '600'}}>{index.key}</span>
        {index.lowerBetter ?

          <span className='lowerBetter'>
          {' '}Note: the lower {index.key} values represent a better performance regarding{' '}
          {index.key === 'MPI' ? 'multidimensional poverty' :
            index.key === 'GII' ? 'gender inequality' :
            index.key
          }.
          </span>
        : null}
      </div>
      <div>
        <div className='svgContainer'>
          <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
            onMouseMove={mouseMove}
            onMouseEnter={mouseMove}
            onMouseLeave={mouseLeave}
            onContextMenu={rightClick}
            ref={svgRef}>

            <g transform={`translate(${margins.left}, ${margins.top})`}>
              <line x1={0} y1={0} x2={0} y2={height} stroke='black' strokeWidth='1' opacity={hoveredPoint ? 0.0 : null} />
              <line x1={0} y1={height} x2={width} y2={height} stroke='black' strokeWidth='1' />
              <g>{yTicks}</g>
              <g>{countryBars}</g>
            </g>

          </svg>
          {tooltip}
        </div>
      </div>
    </div>
  )
}

// function GSNIGraph2(props) {
//   const { index, gsniData } = props
//   const [selectedCountries, setSelectedCountries] = useState([])
//   const svgRef = useRef()
//   const [hoveredPoint, setHoveredPoint] = useState(null)
//   const [hoveredMetric, setHoveredMetric] = useState(null)
//   const countSelectedCountries = selectedCountries.filter(d => d !== '').length

//   const gsniKey = 'Total'
//   const countries = gsniData.filter(d => d.ISO3 !== '' && d[gsniKey] !== '')
//   const sortedCountries = [...countries]
//   sortedCountries.sort((a, b) => b[gsniKey] - a[gsniKey])

//   const windowSize = useWindowSize()
//   const maxBlockSize = 1392
//   const windowWidth = Math.min(maxBlockSize, windowSize.width) - 32 - 20
//   let width = windowWidth
//   // let height = Math.max(windowSize.height * 0.65, 200)
//   let rowHeight = props.windowHeight ? windowSize.height * 0.65 / sortedCountries.length : 20
//   const barHeight = rowHeight - 2
//   let height = rowHeight * sortedCountries.length

//   const margins = { top: 20, right: 0, bottom: 10, left: props.windowHeight ? 10 : 150 }
//   width -= margins.left + margins.right
//   // height -= margins.top + margins.bottom
//   // const rowWidth = width / sortedCountries.length
//   // const barWidth = rowWidth - 2
//   const svgWidth = width + margins.left + margins.right
//   const svgHeight = height + margins.top + margins.bottom
//   // console.log(gsniData)
//   // return null

//   let countryDropdowns = <ComparisonCountrySelectors
//     selectedCountries={selectedCountries}
//     setSelectedCountries={setSelectedCountries}
//     countries={countries}
//     hideSync={true}
//     maxSelectable={3}
//     colorByIndexValue={true}
//   />

//   const xMax = max(countries, d => d[gsniKey])
//   // console.log(yMax)
//   const xScale = scaleLinear()
//     .domain([0, xMax])
//     .range([0, width])

//   const delaunayData = []
//   const averages = useMemo(() => {
//     const averages = {}
//     metrics.forEach(metric => {
//       averages[metric]  = 1
//     })
//     return averages
//   }, [countries])
//   const countryBars = sortedCountries.map((country, countryIndex) => {
//     const totalBarWidth = xScale(country[gsniKey])

//     let runningX = 0
//     let opacity = null
//     const hasSelection = countSelectedCountries > 0
//     const isSelected = hasSelection && selectedCountries.includes(country.ISO3)
//     const y = countryIndex * rowHeight
//     if (hoveredPoint) {
//       if (hoveredPoint.hover[2].row === country) {
//         opacity = 1
//       } else {
//         opacity = 0.2
//       }
//     }
//     const metricTotalSum = sum(metrics, metric => country[metric])

//     const metricBars = metrics.map(metric => {
//       const x = runningX
//       const metricPercentage = country[metric]
//       const rectWidth = totalBarWidth * (metricPercentage / metricTotalSum)
//       runningX += rectWidth
//       let barOpacity = 1
//       if (hoveredMetric) {
//         barOpacity = hoveredMetric === metric ? 1 : 0.2
//       }
//       return (
//         <rect
//           key={metric}
//           width={rectWidth}
//           height={barHeight}
//           x={x}
//           fill={gsniColors[metric]}
//           opacity={barOpacity}
//         />
//       )
//     })
//     // const x = countryIndex * rowWidth
//     delaunayData.push([width/2, y + barHeight / 2, {row: country, col: gsniKey}])
//     let label = props.windowHeight ? null : <text fontWeight='600' textAnchor='end' x='-5' y='14'>{country.Country}</text>
//     if (isSelected) {
//       // label = (
//         // <g transform={`translate(${barWidth / 2}, ${runningY - 5})`}>
//         //   <circle cx={0} cy={0} r={2} fill={'black'} />
//         //   <text fontWeight='600' x={-2} y={-6} fill="black">{country.Country} {format(country[gsniKey])}</text>
//         // </g>
//       // )
//     }
//     return <g opacity={opacity} key={country.ISO3} transform={`translate(${0}, ${y})`}>
//       {/* <rect x={0}
//         width={width} height={barHeight}
//         fill={'black'}
//       /> */}
//       {metricBars}
//       {label}
//     </g>
//   })
//   const delaunay = Delaunay.from(delaunayData)
//   const xTickArray = xScale.ticks()
//   const tickWidth = width / (xTickArray.length - 1)
//   const xTicks = xTickArray.map((tick, tickIndex) => {
//     const x = xScale(tick)

//     return <g key={tick} transform={`translate(${x}, 0)`}>
//       {tickIndex % 2 !== 0 ?
//         <rect width={tickWidth} height={height} fill={'#F7F7F7'} />
//       : null }
//       <text x={0} y={0} dy={'-0.5em'} textAnchor={'middle'}>{format(tick, 'gsni')}</text>
//     </g>
//   })
//   const [exporting, setExporting] = useState(false)

//   const rightClick = (e) => {
//     //export svg
//     const svg = svgRef.current
//     setHoveredPoint(null)
//     setExporting(true)
//     e.preventDefault()
//   }
//   useEffect(() => {
//     if (exporting) {
//       const ref = svgRef.current
//       exportSVG(ref, 'GSNIGraph.svg')
//       setExporting(false)
//     }
//   }, [exporting])
//   const mouseMove = (event) => {
//     const svgPosition = svgRef.current.getBoundingClientRect()
//     const mouseX = event.clientX - svgPosition.left
//     const mouseY = event.clientY - svgPosition.top
//     const closestPointIndex = delaunay.find(mouseX - margins.left, mouseY - margins.top)
//     // console.log(mouseX, mouseY)
//     if (closestPointIndex !== -1 && !isNaN(closestPointIndex)) {
//       // console.log(closestPointIndex)
//       // console.log(delaunayData[closestPointIndex])
//       const x = mouseX
//       const y = mouseY
//       const clientX = x + svgPosition.left
//       setHoveredPoint({ x, y, hover: delaunayData[closestPointIndex], columnWidth: 0, clientX, clientY: event.clientY })
//     }
//   }

//   const mouseLeave = () => {
//     if (hoveredPoint) {
//       setHoveredPoint({... hoveredPoint, unmount: true })
//     }
//   }
//   useEffect(() => {
//     let id = null
//     if (hoveredPoint && hoveredPoint.unmount) {
//       id = setTimeout(() => {
//         setHoveredPoint(null)
//       }, 500)
//     }
//     return () => {
//       clearTimeout(id)
//     }
//   }, [hoveredPoint])

//   let tooltip = null
//   if (hoveredPoint) {
//     const graph = {
//       type: 'index'
//     }
//     tooltip = (
//       <CountryTooltip close={mouseLeave} point={hoveredPoint} index={index} data={gsniData} allRows={[]} graph={graph} />
//     )
//   }

//   const metricGraphHeight = 40
//   const metricGraphBarHeight = 20

//   const metricGraphSum = sum(metrics, metric => averages[metric])
//   const metricGraphBarPadding = 5
//   const metricGraphBarTotalPadding = metricGraphBarPadding * (metrics.length - 1)
//   const metricGraphBarWidth = svgWidth - metricGraphBarTotalPadding
//   const metricGraphXScale = scaleLinear()
//     .domain([0, metricGraphSum])
//     .range([0, metricGraphBarWidth])

//   let runningX = 0
//   const hoverMetric = (metric) => () => {
//     setHoveredMetric(metric)
//   }
//   const masks = []
//   const metricGraphBars = metrics.map((metric, metricIndex) => {
//     const value = averages[metric]
//     const barWidth = metricGraphXScale(value)
//     const x = runningX
//     runningX += barWidth + metricGraphBarPadding
//     const maskId = `gsniMask${metricIndex}`
//     masks.push(
//       <clipPath id={maskId} key={metricIndex} >
//         <rect key={metric} x={x} y={0} width={barWidth} height={metricGraphHeight} fill='#333' />
//       </clipPath>
//     )
//     const textOpacity = !hoveredMetric || (hoveredMetric === metric) ? 1 : 0
//     const clipPathId = hoveredMetric && (hoveredMetric === metric) ? null : `url(#${maskId})`
//     return (
//       <g key={metric} clipPath={clipPathId}>
//         <g transform={`translate(${x}, 10)`}  onMouseOver={hoverMetric(metric)} onMouseOut={hoverMetric(null)}>

//           <text style={{ transition: 'opacity 0.3s ease-in-out', opacity: textOpacity}} fontSize='0.8em' fontWeight='600' dy={'-0.2em'}>{metric}</text>

//           <rect width={barWidth} height={metricGraphBarHeight} fill={gsniColors[metric]} />
//         </g>
//       </g>
//     )
//   })
//   return (
//     <div className='IndexGraph'>
//       <div>
//         {countryDropdowns}
//       </div>
//       <div style={{ fontWeight: 'bold', marginBottom: '0.5em'}}>
//         Percent of people with at least one bias, total and by dimension
//       </div>
//       <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={metricGraphHeight}>
//         <defs>
//           {masks}
//         </defs>

//         {metricGraphBars}
//       </svg>
//       <div style={{ marginLeft: margins.left}}>
//         <span style={{ fontWeight: '600'}}>{index.key}</span>
//         {index.lowerBetter ?

//           <span className='lowerBetter'>
//           {' '}Note: the lower {index.key} values represent a better performance regarding{' '}
//           {index.key === 'MPI' ? 'multidimensional poverty' :
//             index.key === 'GII' ? 'gender inequality' :
//             index.key
//           }.
//           </span>
//         : null}
//       </div>
//       <div>
//         <div className='svgContainer'>
//           <svg fontSize='0.875em' fontFamily='proxima-nova, "Proxima Nova", sans-serif' width={svgWidth} height={svgHeight}
//             onMouseMove={mouseMove}
//             onMouseEnter={mouseMove}
//             onMouseLeave={mouseLeave}
//             onContextMenu={rightClick}
//             ref={svgRef}>

//             <g transform={`translate(${margins.left}, ${margins.top})`}>
//               <line x1={0} y1={0} x2={0} y2={height} stroke='black' strokeWidth='1' opacity={hoveredPoint ? 0.0 : null} />
//               {/* <line x1={0} y1={height} x2={width} y2={height} stroke='black' strokeWidth='1' /> */}
//               <g>{xTicks}</g>
//               <g>{countryBars}</g>
//             </g>

//           </svg>
//           {tooltip}
//         </div>
//       </div>
//     </div>
//   )
// }
