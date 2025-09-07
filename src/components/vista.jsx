import Stock from './stock';
import Productos from './productos';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Vista() {
  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
      <div className="w-100" style={{ maxWidth: 600 }}>
        <h1 className="text-center mb-4">Panel de Productos</h1>
        <Productos />
        <Stock />
      </div>
    </div>
  );
}
