import React, { useEffect, useRef, useState } from 'react';

/**
 * Loader: barra de progreso determinada.
 * - visible: activa/desactiva la barra
 * - progress: 0-100 (opcional). Si no se pasa, se auto-incrementa hasta 90 y finaliza a 100 al cerrar.
 * - text: mensaje opcional.
 */
export default function Loader({ visible = false, progress, text }) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setShow(true);
      if (typeof progress !== 'number') {
        // Modo automático: avanzar hasta 90%
        setInternalProgress(0);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setInternalProgress((p) => {
            const next = p + Math.random() * 8 + 5; // saltos 5-13%
            return Math.min(next, 90);
          });
        }, 350);
      } else {
        setInternalProgress(progress);
      }
    } else {
      // Completar a 100% antes de ocultar
      clearInterval(timerRef.current);
      setInternalProgress(100);
      const to = setTimeout(() => {
        setShow(false);
        setInternalProgress(0);
      }, 300);
      return () => clearTimeout(to);
    }
    return () => clearInterval(timerRef.current);
  }, [visible, progress]);

  useEffect(() => {
    if (typeof progress === 'number') setInternalProgress(progress);
  }, [progress]);

  if (!show) return null;

  const pct = Math.max(0, Math.min(typeof progress === 'number' ? progress : internalProgress, 100));

  return (
    <div role="status" aria-live="polite" aria-label={text || 'Cargando'}>
      <div className="loader-topbar">
        <div className="loader-topbar-progress" style={{ width: pct + '%', animation: 'none' }} />
      </div>
      {text && (
        <div className="loader-toast shadow-sm">
          <span className="small text-muted">{text}</span>
        </div>
      )}
    </div>
  );
}
