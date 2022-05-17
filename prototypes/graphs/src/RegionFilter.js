import Dropdown from './Dropdown'

export const regions = [
  { id: 'SA', name: 'South Asia' },
  { id: 'SSA', name: 'Sub-Saharan Africa' },
  { id: 'LAC', name: 'Latin America and the Caribbean' },
  { id: 'ECA', name: 'Europe and Central Asia' },
  { id: 'EAP', name: 'East Asia and the Pacific' },
  { id: 'AS', name: 'Arab States' },

]
regions.sort((a, b) => a.name.localeCompare(b.name))

export default function RegionFilter(props) {
  const { selectedRegion, setSelectedRegion } = props
  return (
    <Dropdown
      label='Filter By Developing Region'
      values={regions}
      selected={selectedRegion}
      setSelected={setSelectedRegion}
      defaultLabel='All Regions'
    />
  )
}
