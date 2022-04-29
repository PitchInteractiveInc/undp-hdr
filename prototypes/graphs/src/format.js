const warnings = {}
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
    case 'mpi':
      decimals = 1
      break
    case 'gnipc':
    case 'gni_pc':
      decimals = 0
      break

    default:
      if (!warnings[key]) {
        warnings[key] = true
        console.warn('unknown format key', key)
      }
      break
  }
  return (+value).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
}
