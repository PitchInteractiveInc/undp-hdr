export default function getYearOfColumn(column) {
  return column.substr(column.lastIndexOf('_') + 1)
}
