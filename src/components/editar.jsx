  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Editar() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', imagen: '' });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    const { data, error } = await supabase.from('productos').select('*');
    if (!error) setProductos(data);
    setLoading(false);
  }

  function abrirModal(producto) {
    setProductoEditar(producto);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen || ''
    });
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setProductoEditar(null);
    setForm({ nombre: '', descripcion: '', precio: '', stock: '', imagen: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = form.imagen;
    if (form.nuevaImagen) {
      const file = form.nuevaImagen;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('productos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/png',
      });
      if (!uploadError) {
        imageUrl = supabase.storage.from('productos').getPublicUrl(fileName).data.publicUrl;
      }
    }
    const { error } = await supabase.from('productos').update({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock),
      imagen: imageUrl
    }).eq('id', productoEditar.id);
    if (!error) {
      setAlert({ show: true, type: 'success', message: 'Producto actualizado.' });
      fetchProductos();
      cerrarModal();
    } else {
      setAlert({ show: true, type: 'danger', message: 'Error al actualizar.' });
    }
    setLoading(false);
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  }
  function handleFileChange(e) {
    setForm({ ...form, nuevaImagen: e.target.files[0] });
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-center mb-3">Editar Productos</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />
      {alert.show && (
        <div className={`alert alert-${alert.type} text-center`} role="alert">
          {alert.message}
        </div>
      )}
      <div className="row g-3">
        {productosFiltrados.map(p => (
          <div key={p.id} className="col-12">
            <div className="card h-100 shadow-sm d-flex flex-row align-items-center p-3 border-info mb-2" style={{ cursor: 'pointer' }} onClick={() => abrirModal(p)}>
              {p.imagen && <img src={p.imagen} alt={p.nombre} className="img-fluid rounded me-3 border" style={{ width: 60, height: 60, objectFit: 'cover', border: '2px solid #0dcaf0' }} />}
              <div>
                <h5 className="card-title mb-1 text-primary">{p.nombre}</h5>
                <p className="mb-1 text-secondary">{p.descripcion}</p>
                <p className="mb-1"><span className="badge bg-success">${p.precio}</span></p>
                <p className="mb-0"><span className="badge bg-warning text-dark">Stock: {p.stock}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {modalOpen && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Producto</h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea name="descripcion" className="form-control" value={form.descripcion} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio</label>
                    <input name="precio" type="number" className="form-control" value={form.precio} onChange={handleChange} required min={0} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stock</label>
                    <input name="stock" type="number" className="form-control" value={form.stock} onChange={handleChange} required min={0} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Imagen (URL)</label>
                    <input name="imagen" className="form-control mb-2" value={form.imagen} onChange={handleChange} />
                    <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
                    <small className="form-text text-muted">Puedes subir una nueva imagen desde tu dispositivo.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-info" disabled={loading}>Guardar</button>
                  <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
