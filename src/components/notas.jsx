import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Notas() {
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotas();
  }, []);

  async function fetchNotas() {
    setLoading(true);
    const { data, error } = await supabase.from('notas').select('*').order('fecha', { ascending: false });
    if (!error) setNotas(data);
    setLoading(false);
  }

  async function agregarNota(e) {
    e.preventDefault();
    if (!nuevaNota.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('notas').insert([{ texto: nuevaNota }]);
    if (!error) {
      setNuevaNota('');
      fetchNotas();
    }
    setLoading(false);
  }

  async function toggleComprado(id, comprado) {
    await supabase.from('notas').update({ comprado: !comprado }).eq('id', id);
    fetchNotas();
  }

  async function eliminarNota(id) {
    setLoading(true);
    await supabase.from('notas').delete().eq('id', id);
    fetchNotas();
    setLoading(false);
  }

  return (
    <div className="card p-4 shadow mb-4 border-warning">
      <h2 className="text-center mb-3">Notas de Mercadería</h2>
      <form onSubmit={agregarNota} className="mb-3 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Anota mercadería para comprar..."
          value={nuevaNota}
          onChange={e => setNuevaNota(e.target.value)}
        />
        <button type="submit" className="btn btn-warning" disabled={loading}>Agregar</button>
      </form>
      <ul className="list-group">
        {notas.map(nota => (
          <li key={nota.id} className="list-group-item d-flex justify-content-between align-items-center gap-2">
            <span style={{ textDecoration: nota.comprado ? 'line-through' : 'none' }}>
              {nota.texto}
            </span>
            <div className="d-flex gap-2">
              <button className={`btn btn-sm ${nota.comprado ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => toggleComprado(nota.id, nota.comprado)}>
                {nota.comprado ? 'Comprado' : 'Marcar comprado'}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => eliminarNota(nota.id)} title="Eliminar nota">
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
