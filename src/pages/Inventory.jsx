// frontend/src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import { getInventarioActual } from "../api/reportes";

export default function Inventory() {
  const [items, setItems] = useState([]);     // siempre un array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInventarioActual();

      // Nos aseguramos de que sea un arreglo
      if (Array.isArray(data)) {
        setItems(data);
      } else if (Array.isArray(data.items)) {
        // por si en algún momento lo cambiamos a {items: [...]}
        setItems(data.items);
      } else {
        setItems([]);
        setError("Respuesta inesperada del servidor");
      }
    } catch (e) {
      console.error("Error al obtener inventario:", e);
      setError("Error al obtener los medicamentos");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="p-4">
      <h1>Inventario</h1>
      <p>
        Aquí puedes ver el stock actual por medicamento. Las entradas y salidas
        se registran en las pantallas de <b>Compras</b> y <b>Ventas</b>.
      </p>

      <button className="btn btn-primary mb-3" onClick={cargar} disabled={loading}>
        {loading ? "Cargando..." : "Recargar"}
      </button>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!error && !loading && items.length === 0 && (
        <div className="alert alert-info">No hay medicamentos registrados.</div>
      )}

      {!error && items.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock total</th>
                <th>Próx. a caducar</th>
                <th>Fecha más próxima</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nombre}</td>
                  <td>{m.categoria_nombre || "-"}</td>
                  <td>{m.stock_total ?? m.stock ?? 0}</td>
                  <td>{m.stock_por_vencer ?? 0}</td>
                  <td>
                    {m.fecha_caducidad_mas_proxima
                      ? new Date(m.fecha_caducidad_mas_proxima).toLocaleDateString(
                          "es-MX"
                        )
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
