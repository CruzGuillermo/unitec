import 'bootstrap/dist/css/bootstrap.min.css';
import logotipo from '../assets/logotipo.png';
import { useState, useEffect } from 'react';
// import Vista from './vista';
import Productos from './productos';
import Stock from './stock';
import { Package, Boxes, LayoutDashboard, Pencil, StickyNote, User, ShoppingCart, Wrench } from 'lucide-react';
import ServicioTecnico from './ServicioTecnico';
import EditarProducto from './EditarProducto';
import Notas from './notas';
import Login from './Login';
import Carrito from './Carrito';

export default function Sidebar() {
  const [view, setView] = useState('stock');
  const [productoEditar, setProductoEditar] = useState(null);
  const [usuario, setUsuario] = useState(() => {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  });
  // Estado para cantidad de productos en el carrito
  const [cantidadCarrito, setCantidadCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito');
    if (!guardado) return 0;
    try {
      return JSON.parse(guardado).reduce((acc, p) => acc + p.cantidad, 0);
    } catch {
      return 0;
    }
  });

  // Sincronizar badge del carrito en tiempo real
  useEffect(() => {
    const handler = (e) => {
      const count = e.detail?.count;
      if (typeof count === 'number') setCantidadCarrito(count);
    };
    window.addEventListener('carritoUpdate', handler);
    // Emitir evento inicial para alinear otros listeners (opcional)
    try {
      const guardado = localStorage.getItem('carrito');
      const items = guardado ? JSON.parse(guardado) : [];
      const ids = items.map(i => i.id);
      const count = items.reduce((acc, p) => acc + (p.cantidad || 1), 0);
      window.dispatchEvent(new CustomEvent('carritoUpdate', { detail: { count, ids } }));
    } catch {}
    return () => window.removeEventListener('carritoUpdate', handler);
  }, []);



  // Navbar siempre visible, pero solo habilita navegación completa si hay usuario

  const [busqueda, setBusqueda] = useState('');




  const navbar = (
    <nav className="navbar navbar-dark bg-primary" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
        <span className="navbar-brand mb-2 mb-md-0 d-flex flex-column align-items-start" style={{ minWidth: 160 }}>
          <div className="d-flex align-items-center gap-2">
            <img src={logotipo} alt="WhatsApp" style={{ width: 36, height: 36, borderRadius: 8, background: '#fff' }} />
            <span style={{ fontWeight: 'bold', fontSize: 22, color: '#fff', letterSpacing: 1 }}>Unitec</span>
          </div>
          <span style={{ fontSize: 14, color: '#e0e0e0', marginTop: 2, letterSpacing: 0.5 }}>
            Servicio técnico <span style={{ fontWeight: 500, color: '#fff' }}>&amp;</span> accesorios
          </span>
        </span>
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
          <button className={`btn btn-primary d-flex align-items-center justify-content-center position-relative${view==='carrito'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('carrito')} title="Carrito">
            <ShoppingCart size={22} />
            {cantidadCarrito > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 12 }}>
                {cantidadCarrito}
              </span>
            )}
          </button>
          <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='serviciotecnico'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('serviciotecnico')} title="Servicio Técnico">
            <Wrench size={22} />
          </button>
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

  // Si no hay usuario, mostrar Stock y Carrito, y el icono de carrito en el navbar
  if (!usuario) {
    return (
      <div className="bg-light min-vh-100">
        {navbar}
        <div className={`d-flex flex-column py-4 ${view === 'stock' ? '' : 'justify-content-center align-items-center'}`}>
          <div className="w-100" style={view === 'stock' ? undefined : { maxWidth: 700 }}>
            {view === 'stock' && <Stock />}
            {view === 'carrito' && <Carrito onCantidadChange={setCantidadCarrito} />}
            {view === 'serviciotecnico' && <ServicioTecnico />}
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado: navegación completa
  return (
    <div className="bg-light min-vh-100">
      {navbar}
      <div className={`d-flex flex-column py-4 ${view === 'stock' ? '' : 'justify-content-center align-items-center'}`}>
        <div className="w-100" style={view === 'stock' ? undefined : { maxWidth: 700 }}>
          {view === 'productos' && <Productos />}
          {view === 'stock' && <Stock />}
          {view === 'editarproducto' && <EditarProducto />}
          {view === 'notas' && <Notas />}
          {view === 'carrito' && <Carrito onCantidadChange={setCantidadCarrito} />}
          {view === 'serviciotecnico' && <ServicioTecnico />}
        </div>
      </div>
    </div>
  );
}
