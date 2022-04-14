export default function getYearOfColumn(column) {
  if (column.includes('_')) {
    return column.substr(column.lastIndexOf('_') + 1)
  }
  return null
}
