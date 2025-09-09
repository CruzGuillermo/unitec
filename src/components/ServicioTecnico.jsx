import React from 'react';
import { motion } from 'framer-motion';
import logotipo from '../assets/logotipo.png';

export default function ServicioTecnico() {
  return (
    <div className="container py-4" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="card shadow border-info p-4 mx-auto"
        style={{ maxWidth: 500, borderRadius: 18 }}
      >
        <div className="text-center mb-3">
          <img src={logotipo} alt="Unitec" style={{ width: 54, height: 54, borderRadius: 12, marginBottom: 8, boxShadow: '0 2px 8px #1976d233' }} />
          <span className="fw-bold text-primary" style={{ fontSize: 24, letterSpacing: 1 }}>SERVICIO TÉCNICO</span>
          <div style={{ fontWeight: 600, fontSize: 19, color: '#1976d2', marginTop: 2 }}>UNITEC</div>
          <div className="mt-2 mb-2" style={{ fontSize: 15, color: '#333' }}>DESBLOQUEO Y REPARACIÓN DE</div>
          <div className="mb-2" style={{ fontSize: 16, color: '#1976d2', fontWeight: 500 }}>CELULARES Y COMPUTADORAS</div>
        </div>
        <hr />
        <ul className="mb-3" style={{ fontSize: 15 }}>
          <li>🔓 Desbloqueo de todas las marcas</li>
          <li>🛠 Reparación de software y hardware</li>
          <li>📱 Cambio de pantallas, baterías y más</li>
          <li>🧹 Limpieza interna y optimización</li>
          <li>🔄 Actualizaciones y formateos</li>
          <li>💾 Recuperación de datos</li>
        </ul>
        <hr />
        <div className="mb-3" style={{ fontSize: 15 }}>
          <span className="fw-bold">Horario:</span> 9 a 23 hs<br />
          <span className="fw-bold">Teléfono:</span> <a href="https://wa.me/5493854335822" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>3854 335822</a>
        </div>
        <div className="mb-3 d-flex align-items-center gap-3 justify-content-center">
         
          <a href="https://facebook.com/serviciotecnicounitec" target="_blank" rel="noopener noreferrer" title="Facebook" className="d-flex align-items-center gap-1">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" style={{ width: 24, height: 24 }} />
            <span className="fw-bold" style={{ color: '#1877f2', fontSize: 15 }}>Facebook</span>
          </a>
        </div>
        <div className="mb-3 d-flex justify-content-center">
          <a href="https://wa.me/5493854335822" target="_blank" rel="noopener noreferrer" className="btn btn-success d-flex align-items-center gap-2 px-3 py-2" style={{ fontWeight: 600, fontSize: 16 }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WhatsApp_icon.png/598px-WhatsApp_icon.png" alt="WhatsApp" style={{ width: 22, height: 22 }} />
            Consultar por WhatsApp
          </a>
        </div>
        <div className="mb-2 text-success fw-bold text-center" style={{ fontSize: 15 }}>
          ¡ATENCIÓN RÁPIDA Y GARANTIZADA!
        </div>
        <div className="mb-2 text-primary fw-bold text-center" style={{ fontSize: 15 }}>
          ¡CONFIANZA, CALIDAD Y BUEN PRECIO!
        </div>
      </motion.div>
    </div>
  );
}
