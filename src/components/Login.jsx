
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login({ onLogin }) {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nombre', nombre)
      .eq('password', password)
      .single();
    if (data) {
      onLogin(data);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  }

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <h2 className="mb-4">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: 350 }}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">Ingresar</button>
      </form>
    </div>
  );
}
