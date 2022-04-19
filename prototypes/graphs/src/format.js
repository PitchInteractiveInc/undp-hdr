export default function format(value, key) {
  let decimals = 3
  switch (key) {
    case 'mys':
    case 'le':
    case 'eys':
    case 'mmr':
    case 'abr':
    case 'loss':
    case 'pr':
    case 'se':
    case 'lfpr':
      decimals = 1
      break
    case 'gnipc':
    case 'gni_pc':
      decimals = 0
      break
  }
  return (+value).toLocaleString(undefined, { maximumFractionDigits: decimals })
}
