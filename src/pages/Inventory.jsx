// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import { listMedicamentos } from "../api/medicamentos";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listMedicamentos();
      setItems(data.medicamentos || data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al cargar el inventario. Revisa el backend."
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
      <h2>Inventario</h2>
      <p className="text-muted">
        Aquí puedes ver el stock actual por medicamento. Las entradas y salidas
        se registran en las pantallas de Compras y Ventas.
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
                <th>ID</th>
                <th>Código barras</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Stock</th>
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.codigo_barras}</td>
                  <td>{m.nombre}</td>
                  <td>{m.descripcion}</td>
                  <td>{m.stock}</td>
                  <td>{m.categoria?.nombre || m.categoria_nombre}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center">
                    No hay medicamentos registrados.
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
