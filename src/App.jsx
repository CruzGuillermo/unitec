
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Vista from './components/vista';
import Productos from './components/productos';
import Stock from './components/stock';
import Sidebar from './components/sidebar';

function App() {
  const [view, setView] = useState('vista');

  return (
    <Sidebar view={view} setView={setView} />
  );
}

export default App;
