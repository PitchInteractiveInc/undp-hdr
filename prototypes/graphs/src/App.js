import logo from './logo.svg';
import './App.css';
import Graph from './Graph'
import PPAHDIGraph from './PPAHDIGraph'
import {   BrowserRouter,
  Routes,
  Route, NavLink} from 'react-router-dom'
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div>
          <NavLink to='/'>Indicies Graphs</NavLink>{' '}
          <NavLink to='/ppaHDI'>Planetary pressures adjusted HDI</NavLink>
        </div>
        <Routes>
          <Route path='/ppaHDI' element={<PPAHDIGraph />} />
          <Route path='/' element={<Graph />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
