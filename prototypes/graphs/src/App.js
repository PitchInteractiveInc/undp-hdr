import logo from './logo.svg';
import './App.css';
import Graph from './Graph'
import PPAHDIGraph from './PPAHDIGraph'
import MPIGraph from './MPIGraph'
import Countries from './Countries'
import Country from './Country'
import IndexPicker from './IndexPicker'
import {   HashRouter,
  Routes,
  Route, NavLink} from 'react-router-dom'
function App() {
  return (
    <div className="App">
      <HashRouter>
        <div>
          <NavLink to='/indicies'>Indicies Graphs</NavLink>{' '}
          <NavLink to='/ppaHDI'>Planetary pressures adjusted HDI</NavLink>{' '}
          <NavLink to='/mpi'>MPI</NavLink>{' '}
          <NavLink to='/countries'>Countries</NavLink>
        </div>
        <Routes>
          <Route path='/mpi' element={<MPIGraph />} />
          <Route path='/ppaHDI' element={<PPAHDIGraph />} />
          <Route path='/indicies' element={<IndexPicker />}>
            <Route path=':selectedMetricIndex' element={<Graph />} />
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
