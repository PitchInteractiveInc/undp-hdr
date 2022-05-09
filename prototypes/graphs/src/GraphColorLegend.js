import './GraphColorLegend.scss'

export default function GraphColorLegend(props) {
  const { rows } = props
  const opacity = rows.length > 0 ? 1 : 0
  const style = { opacity, display: opacity ? null : 'none' }
  return (
    <div className='GraphColorLegend' style={style}>
      {rows.map((row, i) => {
        const color = row.color
        const country = row.row.Country
        return (
          <div key={i} style={{ color }}>{country}</div>
        )
      })}
    </div>
  )
}
