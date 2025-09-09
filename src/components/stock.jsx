import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Share2, ClipboardCopy, MessageCircle, ArrowUp, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Stock({ onBack }) {
  const [productos, setProductos] = useState([]);
  // Estado para modal de agregar al carrito
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [productoAgregar, setProductoAgregar] = useState(null);
  const [cantidadAgregar, setCantidadAgregar] = useState(1);
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
  function abrirModalAgregar(producto) {
    setProductoAgregar(producto);
    setCantidadAgregar(1);
    setModalAgregarOpen(true);
  }
  function cerrarModalAgregar() {
    setModalAgregarOpen(false);
    setProductoAgregar(null);
    setCantidadAgregar(1);
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
          <motion.div
            key={p.id}
            className="col-6 col-md-6 col-lg-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="card h-100 shadow-sm p-3 border-info mb-2 d-flex flex-column align-items-center" style={{ cursor: 'pointer' }}>
              <div style={{ width: '100%' }} onClick={() => abrirModal(p)}>
                {p.imagen && (
                  <div className="d-flex justify-content-center align-items-center w-100 mb-2" style={{ minHeight: 120 }}>
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="img-fluid rounded border"
                      style={{ maxWidth: 120, height: 120, objectFit: 'cover', border: p.stock === 0 ? '2px solid #dc3545' : '2px solid #0dcaf0' }}
                    />
                  </div>
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
              <button
                className="btn btn-info mt-2 w-100 d-flex align-items-center justify-content-center"
                disabled={p.stock === 0}
                onClick={() => abrirModalAgregar(p)}
                style={{ fontWeight: 'bold' }}
              >
                <ShoppingCart size={18} className="me-2" />
                Agregar al carrito
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-12 text-center text-muted py-5">
            No se encontraron productos.
          </div>
        )}
      </div>
      {/* Modal para agregar al carrito */}
      {modalAgregarOpen && productoAgregar && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Agregar al carrito</h5>
                <button type="button" className="btn-close" onClick={cerrarModalAgregar}></button>
              </div>
              <div className="modal-body text-center">
                {productoAgregar.imagen && (
                  <img src={productoAgregar.imagen} alt={productoAgregar.nombre} className="img-fluid mb-3" style={{ maxHeight: 180, objectFit: 'contain' }} />
                )}
                <h5 className="mb-2">{productoAgregar.nombre}</h5>
                <p className="mb-1">{productoAgregar.descripcion}</p>
                <div className="mb-2">
                  <span className="badge bg-success">${productoAgregar.precio}</span>
                  {productoAgregar.stock === 0 ? (
                    <span className="badge bg-danger ms-2">Sin stock</span>
                  ) : (
                    <span className="badge bg-primary ms-2">Stock: {productoAgregar.stock}</span>
                  )}
                </div>
                <div className="mb-3 d-flex flex-column align-items-center">
                  <label htmlFor="cantidadAgregar" className="form-label">Cantidad</label>
                  <input
                    id="cantidadAgregar"
                    type="number"
                    min={1}
                    max={productoAgregar.stock}
                    value={cantidadAgregar}
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (val < 1) val = 1;
                      if (val > productoAgregar.stock) val = productoAgregar.stock;
                      setCantidadAgregar(val);
                    }}
                    className="form-control text-center"
                    style={{ maxWidth: 120 }}
                    disabled={productoAgregar.stock === 0}
                  />
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-center gap-3 bg-white border-0">
                <button type="button" className="btn btn-info w-100" onClick={() => {
                  // Agregar al carrito en localStorage con cantidad
                  const guardado = localStorage.getItem('carrito');
                  let items = [];
                  if (guardado) {
                    try { items = JSON.parse(guardado); } catch {}
                  }
                  const existe = items.find(p => p.id === productoAgregar.id);
                  if (existe) {
                    items = items.map(p => p.id === productoAgregar.id ? { ...p, cantidad: p.cantidad + cantidadAgregar } : p);
                  } else {
                    items.push({ ...productoAgregar, cantidad: cantidadAgregar });
                  }
                  localStorage.setItem('carrito', JSON.stringify(items));
                  cerrarModalAgregar();
                }} disabled={productoAgregar.stock === 0}>
                  <ShoppingCart size={18} className="me-2" />
                  Confirmar agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <button type="button" className="btn btn-light border d-flex align-items-center justify-content-center" title="WhatsApp" onClick={() => {
                  const url = window.location.href;
                  const text = encodeURIComponent(`${productoModal.nombre} - $${productoModal.precio}\n${productoModal.descripcion}\n${url}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_icon.png/598px-WhatsApp_icon.png" alt="WhatsApp" style={{ width: 22, height: 22, marginRight: 6 }} />
                  <span className="d-none d-md-inline">WhatsApp</span>
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
            bottom: 90,
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
          bottom: 24,
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
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_icon.png/598px-WhatsApp_icon.png" alt="WhatsApp" style={{ width: 28, height: 28 }} />
      </a>
    </div>
  );
}
