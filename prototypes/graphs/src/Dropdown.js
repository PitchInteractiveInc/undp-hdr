import './Dropdown.scss'

let defaultValueAccessor = d => d.id
let defaultLabelAccessor = d => d.name
export default function Dropdown(props) {
  const { selected, setSelected, label, values, defaultLabel, valueAccessor, labelAccessor } = props

  return (
    <div className='Dropdown'>
      <div className='DropdownLabel'>
        {label}
      </div>
      <div className='select'>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          {defaultLabel ? <option value=''>{defaultLabel}</option> : null}
          {values.map(d => {
            const value = valueAccessor ? valueAccessor(d) : defaultValueAccessor(d)
            const label = labelAccessor ? labelAccessor(d) : defaultLabelAccessor(d)
            return <option key={value} value={value}>{label}</option>
          })}
        </select>
      </div>
    </div>
  )
}
