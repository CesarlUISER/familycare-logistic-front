import React from "react";
import { listMedicamentos } from "../api/medicamentos";

/**
 * Tabla simple de inventario con acciones rápidas.
 * Props:
 *  - onEntrada(med)
 *  - onSalida(med)   <-- NUEVO
 */
export default function InventoryTable({ onEntrada, onSalida }) {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await listMedicamentos({ page: 1, limit: 50, sort: "nombre", order: "ASC" });
      setRows(Array.isArray(res?.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { cargar(); }, []);

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h6 className="mb-2">Inventario actual</h6>
        {loading ? (
          <div>Cargando…</div>
        ) : !rows.length ? (
          <div className="text-muted small">Sin resultados.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código barras</th>
                  <th className="text-end">Stock</th>
                  <th className="text-end">Precio</th>
                  <th style={{width: 180}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                    <td>{m.codigo_barras || "—"}</td>
                    <td className="text-end">{m.stock}</td>
                    <td className="text-end">${Number(m.precio || 0).toFixed(2)}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => onEntrada?.(m)}>
                          Entrada
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => onSalida?.(m)}>
                          Salida
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
