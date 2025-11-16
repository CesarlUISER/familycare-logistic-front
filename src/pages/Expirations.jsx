// frontend/src/pages/Expirations.jsx
import React from "react";
import { getAlertas } from "../api/medicamentos";
import { salidaPorCaducidad } from "../api/movimientos";

export default function Expirations() {
  const [filtros, setFiltros] = React.useState({ dias: 60, stock: 20 });
  const [data, setData] = React.useState({ por_caducar: [], stock_bajo: [] });
  const [loading, setLoading] = React.useState(false);
  const [ui, setUi] = React.useState({ msg: "", type: "info" });

  async function cargar() {
    setLoading(true);
    setUi({ msg: "", type: "info" });
    try {
      const res = await getAlertas(filtros);
      setData(res || { por_caducar: [], stock_bajo: [] });
    } catch (e) {
      setUi({ msg: "No se pudieron cargar las alertas.", type: "danger" });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function retirarPorCaducidad(med) {
    const cantidad = Number(prompt(`¿Cuántas unidades retirar por caducidad de "${med.nombre}"?`, "1") || "0");
    if (!cantidad || cantidad <= 0) return;

    try {
      await salidaPorCaducidad({ medicamentoId: med.id, cantidad, motivo: "caducidad" });
      setUi({ msg: `Salida registrada por caducidad (${cantidad}).`, type: "success" });
      await cargar();
    } catch (e) {
      setUi({ msg: "No se pudo registrar la salida.", type: "danger" });
    }
  }

  function Fieldset({ title, children }) {
    return (
      <div className="card mt-3">
        <div className="card-body">
          <h6 className="mb-3">{title}</h6>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Caducidades y alertas</h4>
        <div className="d-flex gap-2">
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: 140 }}
            value={filtros.dias}
            min={1}
            onChange={(e) => setFiltros((f) => ({ ...f, dias: Number(e.target.value || 0) }))}
            placeholder="Días"
            title="Días hasta caducar"
          />
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: 140 }}
            value={filtros.stock}
            min={0}
            onChange={(e) => setFiltros((f) => ({ ...f, stock: Number(e.target.value || 0) }))}
            placeholder="Stock mínimo"
            title="Umbral de stock bajo"
          />
          <button className="btn btn-sm btn-primary" onClick={cargar}>
            Actualizar
          </button>
        </div>
      </div>

      {ui.msg ? <div className={`alert alert-${ui.type} py-2`}>{ui.msg}</div> : null}

      <Fieldset title={`Por caducar (≤ ${filtros.dias} días)`}>
        {loading ? (
          <div>Cargando…</div>
        ) : !data.por_caducar?.length ? (
          <div className="text-muted small">Sin medicamentos próximos a caducar.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicamento</th>
                  <th>Stock</th>
                  <th>Caducidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.por_caducar.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.nombre}</td>
                    <td>{m.stock}</td>
                    <td>{new Date(m.fecha_caducidad).toISOString().slice(0, 10)}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => retirarPorCaducidad(m)}>
                        Retirar (caducidad)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Fieldset>

      <Fieldset title={`Stock bajo (≤ ${filtros.stock})`}>
        {loading ? (
          <div>Cargando…</div>
        ) : !data.stock_bajo?.length ? (
          <div className="text-muted small">Sin alertas de stock bajo.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicamento</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.stock_bajo.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.nombre}</td>
                    <td>{m.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Fieldset>
    </div>
  );
}
