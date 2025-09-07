import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Stock({ onBack }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [productoModal, setProductoModal] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    const { data, error } = await supabase.from('productos').select('*');
    if (!error) setProductos(data);
    setLoading(false);
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function abrirModal(producto) {
    setProductoModal(producto);
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setProductoModal(null);
  }

  return (
    <div>
      <h2 className="text-center mb-3">Stock de Productos</h2>
      <button className="btn btn-secondary mb-3" onClick={onBack}>Volver</button>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />
      {loading ? <p className="text-center">Cargando...</p> : null}
      <div className="row g-3">
        {productosFiltrados.map(p => (
          <div key={p.id} className="col-6 col-lg-4">
            <div className="card h-100 shadow-sm d-flex flex-row align-items-center p-3 border-info mb-2" style={{ cursor: 'pointer' }} onClick={() => abrirModal(p)}>
              {p.imagen && <img src={p.imagen} alt={p.nombre} className="img-fluid rounded me-3 border" style={{ width: 80, height: 80, objectFit: 'cover', border: p.stock === 0 ? '2px solid #dc3545' : '2px solid #0dcaf0' }} />}
              <div>
                <h5 className={`card-title mb-1 ${p.stock === 0 ? 'text-danger' : 'text-primary'}`}>{p.nombre}</h5>
                <p className="mb-1 text-secondary">{p.descripcion}</p>
                <p className="mb-1"><span className="badge bg-success">${p.precio}</span></p>
                <p className="mb-0">
                  {p.stock === 0 ? (
                    <span className="badge bg-danger">Sin stock</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Stock: {p.stock}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal imagen grande */}
      {modalOpen && productoModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{productoModal.nombre}</h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body text-center">
                {productoModal.imagen && (
                  <img src={productoModal.imagen} alt={productoModal.nombre} className="img-fluid mb-3" style={{ maxHeight: 300, objectFit: 'contain' }} />
                )}
                <h5 className="mb-2">${productoModal.precio}</h5>
                <p>{productoModal.descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
