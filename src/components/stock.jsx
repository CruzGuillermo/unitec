import { useState, useEffect } from 'react';
import './StockDesktop.css';
import { supabase } from '../supabaseClient';
import { Share2, ClipboardCopy, MessageCircle, ArrowUp, ShoppingCart, Heart, SlidersHorizontal, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Stock({ onBack }) {
  const [productos, setProductos] = useState([]);
  // Estado para modal de agregar al carrito
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);
  const [productoAgregar, setProductoAgregar] = useState(null);
  const [cantidadAgregar, setCantidadAgregar] = useState(1);
  // Datos y filtros base
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaId, setSubcategoriaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  // Modal imagen
  const [modalOpen, setModalOpen] = useState(false);
  const [productoModal, setProductoModal] = useState(null);
  // Responsive
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 992 : false);
  // Carrito
  const [carritoIds, setCarritoIds] = useState(() => {
    try {
      const guardado = localStorage.getItem('carrito');
      const items = guardado ? JSON.parse(guardado) : [];
      return new Set(items.map(i => i.id));
    } catch { return new Set(); }
  });
  // Favoritos persistentes
  const [favoritos, setFavoritos] = useState(() => {
    try {
      const fav = localStorage.getItem('favoritos');
      return fav ? new Set(JSON.parse(fav)) : new Set();
    } catch { return new Set(); }
  });
  // Filtros: precio y orden
  const [minPrecio, setMinPrecio] = useState('');
  const [maxPrecio, setMaxPrecio] = useState('');
  const [orden, setOrden] = useState('');
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  // Mini-carrito resumen
  const [miniCount, setMiniCount] = useState(() => {
    try {
      const g = localStorage.getItem('carrito');
      const items = g ? JSON.parse(g) : [];
      return items.reduce((acc, p) => acc + (p.cantidad || 1), 0);
    } catch { return 0; }
  });
  const [miniTotal, setMiniTotal] = useState(() => {
    try {
      const g = localStorage.getItem('carrito');
      const items = g ? JSON.parse(g) : [];
      return items.reduce((acc, p) => acc + ((p.precio || 0) * (p.cantidad || 1)), 0);
    } catch { return 0; }
  });

  // Productos filtrados + ordenamiento
  const productosFiltradosBase = productos.filter(p => {
    const matchNombre = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = categoriaId ? p.categoria_id === Number(categoriaId) : true;
    const matchSub = subcategoriaId ? p.subcategoria_id === Number(subcategoriaId) : true;
    const precio = Number(p.precio);
    const min = minPrecio === '' ? -Infinity : Number(minPrecio);
    const max = maxPrecio === '' ? Infinity : Number(maxPrecio);
    const precioOK = !Number.isNaN(precio) && precio >= min && precio <= max;
  const favOK = !soloFavoritos || favoritos.has(p.id);
  return matchNombre && matchCat && matchSub && precioOK && favOK;
  });
  const productosFiltrados = [...productosFiltradosBase].sort((a, b) => {
    switch (orden) {
      case 'precio-asc': return (a.precio || 0) - (b.precio || 0);
      case 'precio-desc': return (b.precio || 0) - (a.precio || 0);
      case 'nombre-asc': return String(a.nombre).localeCompare(String(b.nombre));
      case 'nombre-desc': return String(b.nombre).localeCompare(String(a.nombre));
      default: return 0;
    }
  });

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    const { data } = await supabase.from('categorias').select('*');
    setCategorias(data || []);
  }

  useEffect(() => {
    let isActive = true;
    async function fetchSubs() {
      if (!categoriaId) {
        setSubcategorias([]);
        setSubLoading(false);
        return;
      }
      setSubLoading(true);
      setSubcategorias([]);
      const { data } = await supabase
        .from('subcategorias')
        .select('*')
        .eq('categoria_id', categoriaId);
      if (!isActive) return;
      setSubcategorias(data || []);
      setSubLoading(false);
    }
    fetchSubs();
    return () => { isActive = false; };
  }, [categoriaId]);

  async function fetchProductos() {
    setLoading(true);
    const { data, error } = await supabase.from('productos').select('*');
    if (!error) setProductos(data);
    setLoading(false);
  }


  // Contadores para mejorar UX en filtros (solo UI, no persiste)
  const countByCategoria = productos.reduce((acc, p) => {
    acc[p.categoria_id] = (acc[p.categoria_id] || 0) + 1;
    return acc;
  }, {});
  const productosDeCategoria = categoriaId
    ? productos.filter(p => p.categoria_id === Number(categoriaId))
    : [];
  const countBySubcategoria = productosDeCategoria.reduce((acc, p) => {
    acc[p.subcategoria_id] = (acc[p.subcategoria_id] || 0) + 1;
    return acc;
  }, {});

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

  // Detectar modo desktop para cambiar UI de filtros
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 992px)');
    const onChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Escuchar actualizaciones del carrito (para deshabilitar botones y mantener badge en sync y mini-resumen)
  useEffect(() => {
    const handler = (e) => {
      const ids = e.detail?.ids ?? [];
      setCarritoIds(new Set(ids));
      try {
        const g = localStorage.getItem('carrito');
        const items = g ? JSON.parse(g) : [];
        setMiniCount(items.reduce((acc, p) => acc + (p.cantidad || 1), 0));
        setMiniTotal(items.reduce((acc, p) => acc + ((p.precio || 0) * (p.cantidad || 1)), 0));
      } catch {}
    };
    window.addEventListener('carritoUpdate', handler);
    return () => window.removeEventListener('carritoUpdate', handler);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="stock-desktop-container" style={{ position: 'relative' }}>
      <div className="stock-desktop-grid">
        <aside className="stock-filtros">
          <div className="mb-2 d-flex search-row">
            <input
              type="text"
              className="form-control text-center"
              style={{ maxWidth: 220, minWidth: 120 }}
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          {isDesktop ? (
            <div className="filters-desktop">
              <div className="filter-card">
                <div className="filter-title">Categorías</div>
                <div className="filter-chips">
                  <button
                    type="button"
                    className={`btn btn-sm chip ${categoriaId === '' ? 'chip-active' : 'btn-outline-secondary'}`}
                    onClick={() => { setCategoriaId(''); setSubcategoriaId(''); }}
                  >
                    Todas
                    <span className="badge bg-white text-secondary ms-1">{productos.length}</span>
                  </button>
                  {categorias.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`btn btn-sm chip ${String(categoriaId) === String(cat.id) ? 'chip-active' : 'btn-outline-secondary'}`}
                      onClick={() => { setCategoriaId(String(cat.id)); setSubcategoriaId(''); }}
                    >
                      {cat.nombre}
                      {countByCategoria[cat.id] != null && (
                        <span className="badge bg-white text-secondary ms-1">{countByCategoria[cat.id]}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-card">
                <div className="filter-title d-flex align-items-center">
                  <span>Subcategorías</span>
                  {subLoading && (
                    <div className="spinner-border spinner-border-sm text-secondary ms-2" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  )}
                </div>
                {categoriaId ? (
                  subLoading ? (
                    <div className="text-muted" style={{ fontSize: 14 }}>
                      <div className="spinner-border spinner-border-sm text-secondary me-2" role="status" />
                      Cargando subcategorías...
                    </div>
                  ) : (
                    <div className="filter-chips">
                      <button
                        type="button"
                        className={`btn btn-sm chip ${subcategoriaId === '' ? 'chip-active' : 'btn-outline-secondary'}`}
                        onClick={() => setSubcategoriaId('')}
                      >
                        Todas
                        <span className="badge bg-white text-secondary ms-1">{productosDeCategoria.length}</span>
                      </button>
                      {subcategorias.map(sub => (
                        <button
                          key={sub.id}
                          type="button"
                          className={`btn btn-sm chip ${String(subcategoriaId) === String(sub.id) ? 'chip-active' : 'btn-outline-secondary'}`}
                          onClick={() => setSubcategoriaId(String(sub.id))}
                        >
                          {sub.nombre}
                          {countBySubcategoria[sub.id] != null && (
                            <span className="badge bg-white text-secondary ms-1">{countBySubcategoria[sub.id]}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-muted" style={{ fontSize: 14 }}>Elegí una categoría para ver subcategorías</div>
                )}
              </div>
              {/* Filtro de Precio */}
      <div className="filter-card">
                <div className="filter-title">Precio</div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    className="form-control"
        placeholder="min"
                    value={minPrecio}
                    onChange={e => setMinPrecio(e.target.value)}
        style={{ maxWidth: 90 }}
                  />
                  <span className="text-muted">-</span>
                  <input
                    type="number"
                    className="form-control"
        placeholder="max"
                    value={maxPrecio}
                    onChange={e => setMaxPrecio(e.target.value)}
        style={{ maxWidth: 90 }}
                  />
                </div>
              </div>
              {/* Ordenar por */}
              <div className="filter-card">
                <div className="filter-title">Ordenar por</div>
                <select className="form-select" value={orden} onChange={e => setOrden(e.target.value)}>
                  <option value="">Relevancia</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="nombre-asc">Nombre: A → Z</option>
                  <option value="nombre-desc">Nombre: Z → A</option>
                </select>
              </div>
              {/* Solo favoritos */}
              <div className="filter-card">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="soloFavCheck" checked={soloFavoritos} onChange={e => setSoloFavoritos(e.target.checked)} />
                  <label className="form-check-label" htmlFor="soloFavCheck">
                    Solo favoritos <span className="text-muted">({Array.from(favoritos).length})</span>
                  </label>
                </div>
              </div>
              <div className="filter-actions d-flex justify-content-between align-items-center mt-2">
                <small className="text-muted">{productosFiltrados.length} resultado(s)</small>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0"
                  onClick={() => { setCategoriaId(''); setSubcategoriaId(''); setBusqueda(''); setMinPrecio(''); setMaxPrecio(''); setOrden(''); setSoloFavoritos(false); }}
                >
                  Limpiar filtros
                </button>
              </div>
              {loading && <div className="mt-3 text-primary">Cargando productos...</div>}
            </div>
          ) : (
            <div className="card mobile-filters-card p-2 mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <SlidersHorizontal size={16} className="text-primary" />
                  <span className="fw-semibold small text-primary">Filtros</span>
                </div>
                <span className="badge bg-light text-secondary border">{productosFiltrados.length}</span>
              </div>
              <div className="row g-2">
                <div className="col-12">
                  <label className="form-label small mb-1">Categoría</label>
                  <select
                    className="form-select form-select-sm"
                    value={categoriaId}
                    onChange={e => { setCategoriaId(e.target.value); setSubcategoriaId(''); }}
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small mb-1">Subcategoría</label>
                  <select
                    className="form-select form-select-sm"
                    value={subcategoriaId}
                    onChange={e => setSubcategoriaId(e.target.value)}
                    disabled={!categoriaId || subLoading}
                  >
                    {subLoading ? (
                      <option value="">Cargando subcategorías...</option>
                    ) : (
                      <>
                        <option value="">Todas las subcategorías</option>
                        {subcategorias.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small mb-1">Precio</label>
                  <div className="row g-2 align-items-end">
                    <div className="col-5">
                      <input type="number" className="form-control form-control-sm" placeholder="min" value={minPrecio} onChange={e => setMinPrecio(e.target.value)} />
                    </div>
                    <div className="col-2 d-flex justify-content-center text-muted pb-1">-</div>
                    <div className="col-5">
                      <input type="number" className="form-control form-control-sm" placeholder="max" value={maxPrecio} onChange={e => setMaxPrecio(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small mb-1">Orden</label>
                  <select
                    className="form-select form-select-sm"
                    value={orden}
                    onChange={e => setOrden(e.target.value)}
                  >
                    <option value="">Relevancia</option>
                    <option value="precio-asc">$ menor a mayor</option>
                    <option value="precio-desc">$ mayor a menor</option>
                    <option value="nombre-asc">Nombre A → Z</option>
                    <option value="nombre-desc">Nombre Z → A</option>
                  </select>
                </div>
                <div className="col-12 d-flex align-items-center justify-content-between">
                  <div className="form-check m-0">
                    <input className="form-check-input" type="checkbox" id="soloFavCheckMobile" checked={soloFavoritos} onChange={e => setSoloFavoritos(e.target.checked)} />
                    <label className="form-check-label ms-1" htmlFor="soloFavCheckMobile" style={{ whiteSpace: 'nowrap' }}>
                      Solo fav ({Array.from(favoritos).length})
                    </label>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {loading && <span className="text-primary small">Cargando...</span>}
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 d-inline-flex align-items-center gap-1"
                      onClick={() => { setCategoriaId(''); setSubcategoriaId(''); setBusqueda(''); setMinPrecio(''); setMaxPrecio(''); setOrden(''); setSoloFavoritos(false); }}
                    >
                      <XCircle size={14} />
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
        <section className="stock-productos container-fluid px-0">
          <div className="row g-3 mx-0">
            {productosFiltrados.length > 0 ? productosFiltrados.map(p => (
              <motion.div
                key={p.id}
                className="col-6 col-md-4 col-lg-4 col-xl-3"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
        <div className="card stock-product-card h-100 shadow-sm p-3 mb-2 d-flex flex-column align-items-center" style={{ cursor: 'pointer', position: 'relative' }}>
                  {/* Favoritos */}
                  <button
                    type="button"
          className={`btn btn-light border btn-fav ${favoritos.has(p.id) ? 'active' : ''} position-absolute`}
                    style={{ top: 8, right: 8, width: 32, height: 32, borderRadius: 16, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={(e) => { e.stopPropagation(); setFavoritos(prev => { const nuevo = new Set(prev); if (nuevo.has(p.id)) nuevo.delete(p.id); else nuevo.add(p.id); localStorage.setItem('favoritos', JSON.stringify(Array.from(nuevo))); return nuevo; }); }}
                    aria-label={favoritos.has(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    title={favoritos.has(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    <Heart size={18} color={favoritos.has(p.id) ? '#e53935' : '#6c757d'} fill={favoritos.has(p.id) ? '#e53935' : 'none'} />
                  </button>
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
                    {/* Badges Nuevo/Oferta */}
          <div className="mb-1 d-flex justify-content-center gap-2">
                      {(() => { try { if (p.nuevo) return true; if (p.created_at) return (Date.now() - new Date(p.created_at).getTime()) < 1000*60*60*24*30; } catch{} return false; })() && (
            <span className="badge badge-nuevo">Nuevo</span>
                      )}
                      {((p.oferta === true) || (p.precio_oferta && Number(p.precio_oferta) < Number(p.precio))) && (
            <span className="badge badge-oferta">Oferta</span>
                      )}
                    </div>
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
                    className="btn btn-primary mt-2 w-100 d-flex align-items-center justify-content-center"
                    disabled={p.stock === 0 || carritoIds.has(p.id)}
                    onClick={() => abrirModalAgregar(p)}
                    style={{ fontWeight: 'bold' }}
                  >
                    <ShoppingCart size={18} className="me-2" />
                    {carritoIds.has(p.id) ? 'En carrito' : 'Agregar al carrito'}
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="col-12 text-center text-muted py-5">
                No se encontraron productos.
              </div>
            )}
          </div>
        </section>
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
                  // Actualizar estado local y notificar globalmente
                  const ids = items.map(i => i.id);
                  setCarritoIds(new Set(ids));
                  const count = items.reduce((acc, p) => acc + (p.cantidad || 1), 0);
                  window.dispatchEvent(new CustomEvent('carritoUpdate', { detail: { count, ids } }));
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
