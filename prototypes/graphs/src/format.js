export default function format(value, key) {
  let decimals = 3
  switch (key) {
    case 'mys':
    case 'le':
    case 'eys':
      decimals = 1
      break
    case 'gnipc':
      decimals = 0
      break
  }
  return (+value).toLocaleString(undefined, { maximumFractionDigits: decimals })
}
