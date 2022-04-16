import './GraphColorLegend.scss'

export default function GraphColorLegend(props) {
  const { rows } = props

  return (
    <div className='GraphColorLegend'>
      <div>Color: </div>
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
