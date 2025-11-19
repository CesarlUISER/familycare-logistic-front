// frontend/src/pages/Reports.jsx
import React, { useState } from "react";
import { listarMovimientos } from "../api/movimientos";

export default function Reports() {
  const [tipo, setTipo] = useState("todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoad = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = {
        tipo: tipo === "todos" ? undefined : tipo,
        desde: desde || undefined,
        hasta: hasta || undefined,
      };

      const data = await listarMovimientos(params);
      setItems(data);
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      setError("Error al obtener movimientos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Reportes de movimientos</h1>
      <p>
        Aquí puedes ver todas las entradas y salidas de stock. Usa los filtros
        para acotar por tipo de movimiento y rango de fechas.
      </p>

      <form
        onSubmit={handleLoad}
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <div>
          <label className="form-label">Tipo de movimiento</label>
          <select
            className="form-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
        </div>

        <div>
          <label className="form-label">Desde</label>
          <input
            type="date"
            className="form-control"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Hasta</label>
          <input
            type="date"
            className="form-control"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ minWidth: 140 }}
        >
          {loading ? "Cargando..." : "Aplicar filtros"}
        </button>
      </form>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="alert alert-info" role="alert">
          No hay movimientos para mostrar con los filtros actuales.
        </div>
      )}

      {items.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Medicamento</th>
                <th>Código barras</th>
                <th>Lote</th>
                <th>Cantidad</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((mov) => (
                <tr key={mov.id}>
                  <td>
                    {mov.created_at
                      ? new Date(mov.created_at).toLocaleString("es-MX")
                      : "-"}
                  </td>
                  <td>{mov.tipo}</td>
                  <td>{mov.medicamento_nombre || mov.medicamento?.nombre || "-"}</td>
                  <td>{mov.codigo_barras || mov.medicamento?.codigo_barras || "-"}</td>
                  <td>{mov.lote_codigo || mov.lote?.codigo || "-"}</td>
                  <td>{mov.cantidad}</td>
                  <td>{mov.motivo || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
