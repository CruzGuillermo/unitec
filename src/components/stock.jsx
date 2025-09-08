import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Share2, ClipboardCopy, MessageCircle, ArrowUp } from 'lucide-react';

export default function Stock({ onBack }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaId, setSubcategoriaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [productoModal, setProductoModal] = useState(null);

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    const { data } = await supabase.from('categorias').select('*');
    setCategorias(data || []);
  }

  useEffect(() => {
    async function fetchSubs() {
      if (!categoriaId) {
        setSubcategorias([]);
        return;
      }
      const { data } = await supabase.from('subcategorias').select('*').eq('categoria_id', categoriaId);
      setSubcategorias(data || []);
    }
    fetchSubs();
  }, [categoriaId]);

  async function fetchProductos() {
    setLoading(true);
    const { data, error } = await supabase.from('productos').select('*');
    if (!error) setProductos(data);
    setLoading(false);
  }

  const productosFiltrados = productos.filter(p => {
    const matchNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = categoriaId ? p.categoria_id === Number(categoriaId) : true;
    const matchSub = subcategoriaId ? p.subcategoria_id === Number(subcategoriaId) : true;
    return matchNombre && matchCat && matchSub;
  });

  function abrirModal(producto) {
    setProductoModal(producto);
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setProductoModal(null);
  }

  // Mostrar botón scroll top si se ha hecho scroll
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Escuchar scroll para mostrar el botón
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={{ position: 'relative' }}>
      <h2 className="text-center mb-3">Stock de Productos</h2>
      <div className="mb-2 d-flex justify-content-center">
        <input
          type="text"
          className="form-control text-center"
          style={{ maxWidth: 220, minWidth: 120 }}
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>
      <div className="d-flex flex-row justify-content-center gap-2 mb-3 flex-wrap">
        <select
          className="form-select"
          style={{ maxWidth: 160, minWidth: 100 }}
          value={categoriaId}
          onChange={e => {
            setCategoriaId(e.target.value);
            setSubcategoriaId('');
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        <select
          className="form-select"
          style={{ maxWidth: 160, minWidth: 100 }}
          value={subcategoriaId}
          onChange={e => setSubcategoriaId(e.target.value)}
          disabled={!categoriaId}
        >
          <option value="">Todas las subcategorías</option>
          {subcategorias.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.nombre}</option>
          ))}
        </select>
        {loading && <span className="text-primary">Cargando productos...</span>}
      </div>
      <div className="row g-3">
  {productosFiltrados.length > 0 ? productosFiltrados.map(p => (
          <div key={p.id} className="col-6 col-md-6 col-lg-6">
            <div className="card h-100 shadow-sm p-3 border-info mb-2 d-flex flex-column align-items-center" style={{ cursor: 'pointer' }} onClick={() => abrirModal(p)}>
              {p.imagen && (
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="img-fluid rounded border mb-2"
                  style={{ width: '100%', maxWidth: 120, height: 120, objectFit: 'cover', border: p.stock === 0 ? '2px solid #dc3545' : '2px solid #0dcaf0' }}
                />
              )}
              <h5 className={`card-title mb-1 ${p.stock === 0 ? 'text-danger' : 'text-primary'} text-center`}>{p.nombre}</h5>
              <p className="mb-1 text-secondary text-center">{p.descripcion}</p>
              <p className="mb-1 text-center"><span className="badge bg-success">${p.precio}</span></p>
              <p className="mb-0 text-center">
                {p.stock === 0 ? (
                  <span className="badge bg-danger">Sin stock</span>
                ) : (
                  <span className="badge bg-warning text-dark">Stock: {p.stock}</span>
                )}
              </p>
            </div>
          </div>
        )) : (
          <div className="col-12 text-center text-muted py-5">
            No se encontraron productos.
          </div>
        )}
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
                <div className="mb-2">
                  {productoModal.stock === 0 ? (
                    <span className="badge bg-danger px-3 py-2">Sin stock</span>
                  ) : (
                    <span className="badge bg-primary px-3 py-2">Stock: {productoModal.stock}</span>
                  )}
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-center gap-3 bg-white border-0">
                <button type="button" className="btn btn-light border" title="Compartir" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: productoModal.nombre,
                      text: `${productoModal.nombre} - ${productoModal.descripcion} ($${productoModal.precio})`,
                      url: window.location.href
                    });
                  } else {
                    alert('La función de compartir no está disponible en este dispositivo.');
                  }
                }}>
                  <Share2 size={22} />
                </button>
                <button type="button" className="btn btn-light border" title="WhatsApp" onClick={() => {
                  const url = window.location.href;
                  const text = encodeURIComponent(`${productoModal.nombre} - $${productoModal.precio}\n${productoModal.descripcion}\n${url}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}>
                  <MessageCircle size={22} color="#25D366" />
                </button>
                <button type="button" className="btn btn-light border" title="Copiar link" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('¡Link copiado!');
                }}>
                  <ClipboardCopy size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Botón flotante scroll top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          title="Ir arriba"
        >
          <ArrowUp size={22} />
        </button>
      )}

      {/* Botón flotante WhatsApp */}
      <a
        href="https://wa.me/5493854335822"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          zIndex: 1000,
          background: '#25D366',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 44,
          height: 44,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
        title="WhatsApp"
      >
        <MessageCircle size={26} color="#fff" />
      </a>
    </div>
  );
}
