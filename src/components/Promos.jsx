import React from 'react';

export default function Promos({ promociones = [] }) {
  return (
    <div className="card p-3 shadow border-success mb-3">
      <h4 className="mb-3 text-success">Promociones</h4>
      {promociones.length === 0 ? (
        <div className="text-muted text-center">No hay promociones activas</div>
      ) : (
        <ul className="list-group">
          {promociones.map((promo, idx) => (
            <li key={idx} className="list-group-item d-flex flex-column flex-md-row align-items-md-center gap-2">
              <span className="fw-bold">{promo.titulo}</span>
              <span className="text-success">{promo.descripcion}</span>
              {promo.precio && (
                <span className="badge bg-success ms-auto">${promo.precio}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
