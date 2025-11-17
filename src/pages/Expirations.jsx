// src/pages/Expirations.jsx
import React, { useEffect, useState } from "react";
import { getInventarioActual } from "../api/reportes"; // 👈 usamos este que sí existe

export default function Expirations() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      // De momento reutilizamos el inventario actual
      const data = await getInventarioActual();
      // Ajusta según cómo te responda el backend
      setItems(data.lotes || data.medicamentos || data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al cargar los medicamentos próximos a caducar."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Próximos a caducar</h2>
      <p className="text-muted">
        (De momento se muestra la información del reporte de inventario actual.
        Luego afinamos el backend para que solo traiga los que realmente están
        cerca de caducar.)
      </p>

      <button className="btn btn-secondary mb-3" onClick={cargar}>
        Recargar
      </button>

      {cargando && <p>Cargando...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!cargando && !error && (
        <div className="table-responsive">
          <table className="table table-sm table-striped">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Lote</th>
                <th>Fecha caducidad</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((lote) => (
                <tr key={lote.id || `${lote.medicamento_id}-${lote.codigo}`}>
                  <td>{lote.medicamento?.nombre || lote.medicamento_nombre}</td>
                  <td>{lote.codigo}</td>
                  <td>
                    {lote.caducidad
                      ? new Date(lote.caducidad).toLocaleDateString()
                      : ""}
                  </td>
                  <td>{lote.stock}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">
                    No hay registros para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
