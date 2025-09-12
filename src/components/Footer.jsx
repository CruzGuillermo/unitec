import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-auto py-3"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
        borderTop: '3px solid #0d6efd',
      }}
    >
      <div className="container-fluid text-center">
        <div className="small text-muted">
          © {year} <span className="fw-semibold text-primary">Unitec</span>. Todos los derechos reservados.
        </div>
        <div className="small text-muted">
          Desarrollado por <a href="https://portafolio-eta-eight.vercel.app/" target="_blank" rel="noopener noreferrer" className="fw-semibold text-primary">Guillermo Cruz</a>
        </div>
      </div>
    </footer>
  );
}
