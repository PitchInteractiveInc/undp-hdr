import './HDILabels.scss'
import hdiBackgroundRectData from './hdiBackgroundRectData'
import classNames from 'classnames'
export default function HDILabels(props) {
  const { inline } = props
  return (
    <div className={classNames('HDILabels', { inline })}>
      <div style={{ marginRight: '1em'}}>HDI classification (value):</div>
      {hdiBackgroundRectData.map((backgroundRect, i) => {
        return (

          <div key={i} className='hdiValue' >
            <div className='background' style={{ opacity: backgroundRect.opacity, backgroundColor: backgroundRect.fill }} />
            {backgroundRect.label}
          </div>
        )
      })}
    </div>
  )

}