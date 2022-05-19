import './HDILabels.scss'
import hdiBackgroundRectData from './hdiBackgroundRectData'
import classNames from 'classnames'
export default function HDILabels(props) {
  const { inline, width } = props
  return (
    <div className={classNames('HDILabels', { inline })} style={{ width }}>
      <div style={{ marginRight: '1em', fontSize: '0.875em'}}>HDI classification (value):</div>
      <div className='labels'>
        {hdiBackgroundRectData.map((backgroundRect, i) => {
          return (

            <div key={i} className='hdiValue' >
              <div className='background' style={{ opacity: backgroundRect.opacity, backgroundColor: backgroundRect.fill }} />
              {backgroundRect.label}
            </div>
          )
        })}
      </div>
    </div>
  )

}
