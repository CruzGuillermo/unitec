import { useState } from 'react';
import { supabase } from '../supabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Productos({ onAdd }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

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
      { ...form, precio: Number(form.precio), stock: Number(form.stock), imagen: imageUrl }
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
          <label className="form-label">Imagen</label>
          <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>Agregar producto</button>
      </form>
    </div>
  );
}
