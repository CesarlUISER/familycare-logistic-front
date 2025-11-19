// frontend/src/pages/Expirations.jsx
import React, { useEffect, useState } from "react";
import { getExpirations } from "../api/reportes";

export default function Expirations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getExpirations(); // viene de /reportes/expirations
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al cargar expirations:", e);
      setError("Error al cargar los medicamentos próximos a caducar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div>
      <h1>Próximos a caducar</h1>
      <p>
        (De momento se muestra la información del reporte de inventario actual.
        Luego afinamos el backend para que solo traiga los que realmente están
        cerca de caducar.)
      </p>

      <button onClick={cargar} disabled={loading}>
        {loading ? "Cargando..." : "Recargar"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#ffd6d6",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      <table
        style={{
          marginTop: 24,
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Medicamento</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Lote</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>
              Fecha caducidad
            </th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}
              >
                No hay registros para mostrar.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={`${item.medicamento_id}-${item.lote_codigo}-${item.fecha_caducidad}`}
              >
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {item.medicamento_nombre}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {item.lote_codigo}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {item.fecha_caducidad
                    ? new Date(item.fecha_caducidad).toLocaleDateString("es-MX")
                    : "-"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {item.stock}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
