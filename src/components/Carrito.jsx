import React, { useState, useEffect } from 'react';

export default function Carrito({ onCantidadChange }) {
  const [items, setItems] = useState(() => {
    const guardado = localStorage.getItem('carrito');
    return guardado ? JSON.parse(guardado) : [];
  });

  // Persistir en localStorage y notificar cantidad
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
    if (onCantidadChange) onCantidadChange(items.reduce((acc, p) => acc + p.cantidad, 0));
  }, [items, onCantidadChange]);

  // Agregar producto al carrito
  function agregar(producto) {
    setItems(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }

  // Quitar producto del carrito
  function quitar(id) {
    setItems(prev => prev.filter(p => p.id !== id));
  }

  // Cambiar cantidad de un producto
  function cambiarCantidad(id, nuevaCantidad) {
    setItems(prev => prev.map(p => {
      if (p.id === id) {
        let cantidadFinal = nuevaCantidad;
        if (cantidadFinal < 1) cantidadFinal = 1;
        if (p.stock && cantidadFinal > p.stock) cantidadFinal = p.stock;
        return { ...p, cantidad: cantidadFinal };
      }
      return p;
    }));
  }

  // Vaciar carrito
  function vaciar() {
    setItems([]);
  }

  // Calcular total
  const total = items.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  return (
    <div className="card p-3 shadow border-info mb-3">
      <h4 className="mb-3">Carrito</h4>
      {items.length === 0 ? (
        <div className="text-muted text-center">El carrito está vacío</div>
      ) : (
        <ul className="list-group mb-3">
          {items.map(item => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center gap-2">
              {item.imagen && (
                <img src={item.imagen} alt={item.nombre} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #0dcaf0' }} />
              )}
              <span className="flex-grow-1 ms-2">{item.nombre}</span>
              <div className="d-flex flex-column align-items-center" style={{ minWidth: 70 }}>
                <input
                  type="number"
                  min={1}
                  max={item.stock || 99}
                  value={item.cantidad}
                  onChange={e => cambiarCantidad(item.id, Number(e.target.value))}
                  className="form-control text-center"
                  style={{ width: 60 }}
                />
                {item.stock && item.cantidad > item.stock && (
                  <span className="text-danger small" style={{ lineHeight: 1, fontSize: 11 }}>Máx: {item.stock}</span>
                )}
              </div>
              <span>${item.precio * item.cantidad}</span>
              <button className="btn btn-sm btn-danger ms-2 p-1 d-flex align-items-center justify-content-center" style={{ width: 24, height: 24 }} onClick={() => quitar(item.id)} aria-label="Quitar">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" fill="#fff"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="d-flex justify-content-between align-items-center">
        <strong>Total:</strong>
        <span className="fw-bold">${total}</span>
      </div>
      <button className="btn btn-warning w-100 mt-3" onClick={vaciar} disabled={items.length === 0}>Vaciar carrito</button>
      <button
        className="btn btn-success w-100 mt-2 d-flex align-items-center justify-content-center"
        disabled={items.length === 0}
        onClick={() => {
          const numero = '5493854335822'; // Puedes cambiar el número aquí si lo necesitas
          const productosTexto = items.map(item => `• ${item.nombre} (${item.descripcion}) x${item.cantidad} ($${item.precio * item.cantidad})`).join('\n');
          const totalTexto = `Total: $${total}`;
          const mensaje = encodeURIComponent(`¡Hola! Quiero pedir:\n${productosTexto}\n${totalTexto}`);
          window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
        }}
        title="Enviar pedido por WhatsApp"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_icon.png/598px-WhatsApp_icon.png" alt="WhatsApp" style={{ width: 22, height: 22, marginRight: 8 }} />
        Enviar pedido por WhatsApp
      </button>
    </div>
  );
}
