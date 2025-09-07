import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
// import Vista from './vista';
import Productos from './productos';
import Stock from './stock';
import { Package, Boxes, LayoutDashboard, Pencil, StickyNote } from 'lucide-react';
import Editar from './editar';
import Notas from './notas';

export default function Sidebar() {
  const [view, setView] = useState('stock');
  const [productoEditar, setProductoEditar] = useState(null);

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">Servicio Tecnico Unitec</span>
          <div className="d-flex gap-2">
            <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='productos'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('productos')} title="Productos">
              <Package size={20} />
            </button>
            <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='stock'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('stock')} title="Stock">
              <Boxes size={20} />
            </button>
            {/* Vista eliminada */}
            <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='editar'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('editar')} title="Editar">
              <Pencil size={20} />
            </button>
             <button className={`btn btn-primary d-flex align-items-center justify-content-center${view==='notas'?' active':''}`} style={{ width: 40, height: 40 }} onClick={()=>setView('notas')} title="Notas">
              <StickyNote size={20} />
            </button>
          </div>
        </div>
      </nav>
      <div className="d-flex flex-column justify-content-center align-items-center py-4">
        <div className="w-100" style={{ maxWidth: 700 }}>
          {/* Vista eliminada */}
          {view === 'productos' && <Productos />}
          {view === 'stock' && <Stock onBack={()=>setView('vista')} />}
          {view === 'editar' && <Editar producto={productoEditar || {}} onSave={()=>setView('productos')} onCancel={()=>setView('productos')} />}
             {view === 'notas' && <Notas />}
        </div>
      </div>
    </div>
  );
}
