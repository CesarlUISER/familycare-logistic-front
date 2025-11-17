// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import { listarMovimientos } from "../api/movimientos";

export default function Reports() {
  const [movs, setMovs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [filtro, setFiltro] = useState({
    tipo: "todos",
  });

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const params = {};
      if (filtro.tipo !== "todos") {
        params.tipo = filtro.tipo;
      }
      const data = await listarMovimientos(params);
      setMovs(data.movimientos || data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al cargar los movimientos. Revisa el backend."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    cargar();
  };

  return (
    <div className="container mt-4">
      <h2>Reportes de movimientos</h2>

      <form className="card p-3 mb-3" onSubmit={handleSubmit}>
        <div className="row align-items-end">
          <div className="col-md-4 mb-2">
            <label className="form-label">Tipo de movimiento</label>
            <select
              className="form-select"
              name="tipo"
              value={filtro.tipo}
              onChange={handleChange}
            >
              <option value="todos">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="salida">Salidas</option>
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <button className="btn btn-primary w-100" type="submit">
              Aplicar filtros
            </button>
          </div>
        </div>
      </form>

      {cargando && <p>Cargando...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!cargando && !error && (
        <div className="table-responsive">
          <table className="table table-sm table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Medicamento</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Documento</th>
              </tr>
            </thead>
            <tbody>
              {movs.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>
                    {m.created_at
                      ? new Date(m.created_at).toLocaleString()
                      : ""}
                  </td>
                  <td>{m.tipo}</td>
                  <td>{m.medicamento?.nombre || m.medicamento_nombre}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.motivo}</td>
                  <td>{m.documento_ref}</td>
                </tr>
              ))}
              {movs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">
                    No hay movimientos con los filtros seleccionados.
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
