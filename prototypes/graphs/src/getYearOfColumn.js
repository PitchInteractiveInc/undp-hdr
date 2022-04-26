export default function getYearOfColumn(column) {
  if (column == null) {
    console.log('invalid column passed')
    console.trace()
    debugger
  }
  if (column.includes('_')) {
    return column.substr(column.lastIndexOf('_') + 1)
  }
  return null
}
