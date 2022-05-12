import './App.scss';
import Graph from './IndexGraph'
import Countries from './Countries'
import Country from './Country'
import IndexPicker from './IndexPicker'
import CountryRanks from './CountryRanks'
import {   HashRouter,
  Routes,
  Route, NavLink} from 'react-router-dom'
import classNames from 'classnames';

function App() {
  const hideReactNav = 'drupalSettings' in window
  return (
    <div className={ classNames("App", { hideReactNav })}>
      <HashRouter>
        <div className='nav'>
          <NavLink to='/indicies'>Indicies Graphs</NavLink>{' '}
          {/* <NavLink to='/ppaHDI'>Planetary pressures adjusted HDI</NavLink>{' '}
          <NavLink to='/mpi'>MPI</NavLink>{' '} */}
          <NavLink to='/countries'>Countries</NavLink>{' '}
          <NavLink to='/ranks'>Country Ranks</NavLink>
        </div>
        <Routes>
          <Route path='/ranks' element={<CountryRanks />} />
          <Route path='/indicies' element={<IndexPicker />}>
            <Route path=':selectedMetricShortName' element={<Graph />} />
          </Route>
          <Route path='/countries' element={<Countries />}>
            <Route path=':country' element={<Country />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
