import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Productos({ onAdd }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', subcategoria_id: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  // Cargar categorías al montar
  useEffect(() => {
    async function fetchCategorias() {
      const { data } = await supabase.from('categorias').select('*');
      setCategorias(data || []);
    }
    fetchCategorias();
  }, []);

  // Cargar subcategorías cuando cambia la categoría seleccionada
  useEffect(() => {
    async function fetchSubcategorias() {
      if (!form.categoria_id) {
        setSubcategorias([]);
        return;
      }
      const { data } = await supabase.from('subcategorias').select('*').eq('categoria_id', form.categoria_id);
      setSubcategorias(data || []);
    }
    fetchSubcategorias();
  }, [form.categoria_id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('productos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/png',
      });
      if (uploadError) {
        setAlert({ show: true, type: 'danger', message: 'Error al subir la imagen: ' + uploadError.message });
        setLoading(false);
        return;
      }
      imageUrl = supabase.storage.from('productos').getPublicUrl(fileName).data.publicUrl;
    }
    const { error } = await supabase.from('productos').insert([
      {
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock),
        imagen: imageUrl,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        subcategoria_id: form.subcategoria_id ? Number(form.subcategoria_id) : null
      }
    ]);
    if (!error) {
      setAlert({ show: true, type: 'success', message: 'Producto agregado correctamente.' });
      setForm({ nombre: '', descripcion: '', precio: '', stock: '' });
      setFile(null);
      if (onAdd) onAdd();
    } else {
      setAlert({ show: true, type: 'danger', message: 'Error al agregar producto.' });
    }
    setLoading(false);
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  }

  return (
    <div>
      <div className="card p-4 shadow mb-4 border-primary">
        <h2 className="text-center mb-3">Agregar Producto</h2>
        {alert.show && (
          <div className={`alert alert-${alert.type} text-center`} role="alert">
            {alert.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input name="nombre" className="form-control" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea name="descripcion" className="form-control" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Precio</label>
            <input name="precio" type="number" className="form-control" placeholder="Precio" value={form.precio} onChange={handleChange} required min={0} />
          </div>
          <div className="mb-3">
            <label className="form-label">Stock</label>
            <input name="stock" type="number" className="form-control" placeholder="Stock" value={form.stock} onChange={handleChange} required min={0} />
          </div>
          <div className="mb-3">
            <label className="form-label">Categoría</label>
            <select name="categoria_id" className="form-select" value={form.categoria_id} onChange={handleChange} required>
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Subcategoría</label>
            <select name="subcategoria_id" className="form-select" value={form.subcategoria_id} onChange={handleChange} required disabled={!form.categoria_id}>
              <option value="">Selecciona una subcategoría</option>
              {subcategorias.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.nombre}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Imagen</label>
            <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>Agregar producto</button>
        </form>
      </div>

      {/* Formulario para crear categoría */}
      <div className="card p-3 shadow mb-3 border-info">
        <h5 className="mb-3">Crear nueva categoría</h5>
        <form onSubmit={async e => {
          e.preventDefault();
          const nombre = e.target.nombre.value.trim();
          if (!nombre) return;
          const { error } = await supabase.from('categorias').insert([{ nombre }]);
          if (!error) {
            e.target.reset();
            const { data } = await supabase.from('categorias').select('*');
            setCategorias(data || []);
            alert('Categoría creada');
          } else {
            alert('Error al crear categoría');
          }
        }}>
          <div className="input-group">
            <input name="nombre" className="form-control" placeholder="Nombre de categoría" required />
            <button type="submit" className="btn btn-success">Crear</button>
          </div>
        </form>
      </div>

      {/* Formulario para crear subcategoría */}
      <div className="card p-3 shadow mb-3 border-info">
        <h5 className="mb-3">Crear nueva subcategoría</h5>
        <form onSubmit={async e => {
          e.preventDefault();
          const nombre = e.target.nombre.value.trim();
          const categoria_id = e.target.categoria_id.value;
          if (!nombre || !categoria_id) return;
          const { error } = await supabase.from('subcategorias').insert([{ nombre, categoria_id: Number(categoria_id) }]);
          if (!error) {
            e.target.reset();
            if (form.categoria_id) {
              const { data } = await supabase.from('subcategorias').select('*').eq('categoria_id', form.categoria_id);
              setSubcategorias(data || []);
            }
            alert('Subcategoría creada');
          } else {
            alert('Error al crear subcategoría');
          }
        }}>
          <div className="row g-2">
            <div className="col-md-7">
              <input name="nombre" className="form-control" placeholder="Nombre de subcategoría" required />
            </div>
            <div className="col-md-3">
              <select name="categoria_id" className="form-select" required>
                <option value="">Categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100">Crear</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
