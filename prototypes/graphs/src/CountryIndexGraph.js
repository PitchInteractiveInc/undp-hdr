import { Link } from 'react-router-dom';
import './CountryIndexGraph.scss'
export default function CountryIndexGraph(props) {
  const { data, country, index } = props

  return (
    <div className='CountryIndexGraph'>
      <div className='indexText'>
        <div className='key'>{index.key}</div>
        <div className='name'>{index.name}</div>
        <div className='description'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc hendrerit ligula sit amet tortor auctor semper. Aliquam aliquet, augue non consectetur congue, eros enim tempor ipsum, ac fringilla odio tellus a sapien. Integer maximus sem id justo consectetur, vitae porttitor est efficitur.
        </div>
        <div className='indicatorLink'>
          <Link to={`/indicies/${index.key}`}>More Insights on {index.key}</Link>
        </div>
      </div>
      <div className='indexGraphs'>

      </div>
    </div>
  )
}