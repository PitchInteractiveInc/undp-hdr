import logo from './logo.svg';
import './App.css';
import Graph from './Graph'
import PPAHDIGraph from './PPAHDIGraph'
import MPIGraph from './MPIGraph'
import {   HashRouter,
  Routes,
  Route, NavLink} from 'react-router-dom'
function App() {
  return (
    <div className="App">
      <HashRouter>
        <div>
          <NavLink to='/'>Indicies Graphs</NavLink>{' '}
          <NavLink to='/ppaHDI'>Planetary pressures adjusted HDI</NavLink>{' '}
          <NavLink to='/mpi'>MPI</NavLink>
        </div>
        <Routes>
          <Route path='/mpi' element={<MPIGraph />} />
          <Route path='/ppaHDI' element={<PPAHDIGraph />} />
          <Route path='/' element={<Graph />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
