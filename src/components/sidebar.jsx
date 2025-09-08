import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
// import Vista from './vista';
import Productos from './productos';
import Stock from './stock';
import { Package, Boxes, LayoutDashboard, Pencil, StickyNote, User } from 'lucide-react';
import EditarProducto from './EditarProducto';
import Notas from './notas';
import Login from './Login';

export default function Sidebar() {
  const [view, setView] = useState('stock');
  const [productoEditar, setProductoEditar] = useState(null);
  const [usuario, setUsuario] = useState(() => {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  });



  // Navbar siempre visible, pero solo habilita navegación completa si hay usuario

  const [busqueda, setBusqueda] = useState('');




  const navbar = (
    <nav className="navbar navbar-dark bg-primary" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
        <span className="navbar-brand mb-2 mb-md-0">Unitec</span>
  <div className="d-flex gap-2 flex-wrap align-items-center">
          {usuario && (
            <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='productos'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('productos')} title="Productos">
              <Package size={22} />
            </button>
          )}
          <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='stock'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('stock')} title="Stock">
            <Boxes size={22} />
          </button>
          {usuario && (
            <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='editarproducto'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('editarproducto')} title="Editar Producto">
              <Pencil size={22}  />
            </button>
          )}
          {usuario && (
            <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='notas'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('notas')} title="Notas">
              <StickyNote size={22} />
            </button>
          )}
          {usuario ? (
            <button className="btn btn-danger d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }} onClick={handleLogout} title="Cerrar sesión">
              <span style={{ fontWeight: 'bold', fontSize: 18 }}>×</span>
            </button>
          ) : (
            <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='usuarios'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('usuarios')} title="Usuarios">
              <User size={22} />
            </button>
          )}
        </div>
  {/* El input de búsqueda se muestra solo en Stock */}
      </div>
    </nav>
  );

  // Función para cerrar sesión
  function handleLogout() {
    setUsuario(null);
    localStorage.removeItem('usuario');
    setView('stock');
  }

  // Si el usuario pulsa "Usuarios", mostrar el login
  if (view === 'usuarios') {
    return (
      <div className="bg-light min-vh-100">
        {navbar}
        <Login onLogin={user => {
          setUsuario(user);
          localStorage.setItem('usuario', JSON.stringify(user));
          setView('stock');
        }} />
      </div>
    );
  }

  // Si no hay usuario, solo mostrar Stock y pasar busqueda
  if (!usuario) {
    return (
      <div className="bg-light min-vh-100">
        {navbar}
        <div className="d-flex flex-column justify-content-center align-items-center py-4">
          <div className="w-100" style={{ maxWidth: 700 }}>
            <Stock />
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado: navegación completa
  return (
    <div className="bg-light min-vh-100">
      {navbar}
      <div className="d-flex flex-column justify-content-center align-items-center py-4">
        <div className="w-100" style={{ maxWidth: 700 }}>
          {view === 'productos' && <Productos />}
          {view === 'stock' && <Stock />}
          {view === 'editarproducto' && <EditarProducto />}
          {view === 'notas' && <Notas />}
        </div>
      </div>
    </div>
  );
}
