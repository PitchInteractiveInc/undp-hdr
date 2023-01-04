import { group } from 'd3-array'
import './Dropdown.scss'

let defaultValueAccessor = d => d.id
let defaultLabelAccessor = d => d.name
export default function Dropdown(props) {
  const {
    selected,
    setSelected,
    label,
    values,
    defaultLabel,
    valueAccessor,
    labelAccessor,
    optGroupAccessor,
    optGroupLabels,
    style
  } = props

  const optionMapper = d => {
    const value = valueAccessor ? valueAccessor(d) : defaultValueAccessor(d)
    const label = labelAccessor ? labelAccessor(d) : defaultLabelAccessor(d)
    return <option key={value} value={value}>{label}</option>
  }
  let options = values.map(optionMapper)
  if (optGroupAccessor) {
    const optionsByOptGroup = Array.from(group(values, optGroupAccessor), ([key, value]) => ({key, value}))
    options = optionsByOptGroup.map((optionGroup) => {
      const optionKey = optionGroup.key
      const optionValues = optionGroup.value
      const label = optGroupLabels && optGroupLabels[optionKey] ? optGroupLabels[optionKey] : optionKey
      return (
        <optgroup label={label} key={optionKey}>
          {optionValues.map(optionMapper)}
        </optgroup>
      )
    })
  }
  return (
    <div className='Dropdown' style={style}>
      <div className='DropdownLabel'>
        {label}
      </div>
      <div className='select'>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          {defaultLabel ? <option value=''>{defaultLabel}</option> : null}
          {options}
        </select>
      </div>
    </div>
  )
}
