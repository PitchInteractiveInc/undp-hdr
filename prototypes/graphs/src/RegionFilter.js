import './RegionFilter.scss'

const regions = [
  { id: 'SA', name: 'South America' },
  { id: 'SSA', name: 'Sub-Saharan Africa' },
  { id: 'LAC', name: 'Latin American and the Caribbean' },
  { id: 'ECA', name: 'Europe and Central Asia' },
  { id: 'EAP', name: 'East Asia and the Pacific' },
  { id: 'AS', name: 'Arab States' },

]
regions.sort((a, b) => a.name.localeCompare(b.name))

export default function RegionFilter(props) {
  const { selectedRegion, setSelectedRegion } = props
  return (
    <div className='RegionFilter'>
      <div className='label'>
        Filter by Region
      </div>
      <div className='select'>
        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
          <option value=''>All Regions</option>
          {regions.map(d => {
            return <option key={d.id} value={d.id}>{d.name}</option>
          })}
        </select>
      </div>
    </div>
  )
}
