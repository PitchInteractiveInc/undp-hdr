export default function getGraphColumnsForKey(data, dataKey) {
  const graphColumns = Array.from(new Set(data.columns.filter(key => {
    let keyRe = new RegExp(`^${dataKey.toLowerCase()}_[0-9]{4}`)
    if (dataKey === 'MPI') {
      keyRe = /^MPI$/i
    }
    return key.toLowerCase().match(keyRe)
  })))
  // console.log(graphColumns)
  return graphColumns
}
