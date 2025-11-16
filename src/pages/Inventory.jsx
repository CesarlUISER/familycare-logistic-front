// frontend/src/pages/Inventory.jsx
import React from "react";
import BarcodeInput from "../components/BarcodeInput";
import InventoryTable from "../components/InventoryTable";
import { getByBarcode, createMedicamento } from "../api/medicamentos";
import { entradaConCaducidad, listarMovimientos, registrarSalida } from "../api/movimientos";

export default function Inventory() {
  const [ui, setUi] = React.useState({ msg: "", type: "info" });
  // step: null | {mode:'nuevo'|'entrada'|'salida', code, med?, fromNew?: boolean}
  const [step, setStep] = React.useState(null);

  // Formulario ENTRADA
  const [entradaForm, setEntradaForm] = React.useState({
    cantidad: 1,
    lote: "",
    caducidad: "",
    motivo: "compra",
  });

  // Formulario SALIDA
  const [salidaForm, setSalidaForm] = React.useState({
    cantidad: 1,
    motivo: "venta",
    documento_ref: "",
  });

  // Últimos movimientos
  const [recent, setRecent] = React.useState([]);
  async function refreshRecent() {
    try {
      const rows = await listarMovimientos({ limit: 10 });
      setRecent(rows);
    } catch {}
  }
  React.useEffect(() => { refreshRecent(); }, []);

  // Acciones rápidas desde la tabla
  function handleQuickEntrada(med) {
    setUi({ msg: "", type: "info" });
    setStep({ mode: "entrada", code: med.codigo_barras || "", med, fromNew: false });
    setEntradaForm({ cantidad: 1, lote: "", caducidad: "", motivo: "compra" });
  }
  function handleQuickSalida(med) {
    setUi({ msg: "", type: "info" });
    setStep({ mode: "salida", code: med.codigo_barras || "", med });
    setSalidaForm({ cantidad: 1, motivo: "venta", documento_ref: "" });
  }

  // Escaneo: por defecto va a ENTRADA si existe; si no, alta
  async function handleScan(code) {
    setUi({ msg: "", type: "info" });
    setStep(null);
    try {
      const med = await getByBarcode(code);
      setStep({ mode: "entrada", code, med, fromNew: false });
      setEntradaForm({ cantidad: 1, lote: "", caducidad: "", motivo: "compra" });
    } catch {
      setStep({ mode: "nuevo", code, med: null });
    }
  }

  // Alta de medicamento (nuevo)
  async function onCreateMedicamento(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fechaRef = form.get("fecha_caducidad") || "2099-12-31";

    const payload = {
      nombre: form.get("nombre")?.trim(),
      descripcion: form.get("descripcion")?.trim() || null,
      precio: Number(form.get("precio") || 0),
      stock: 0,
      fecha_caducidad: fechaRef,
      categoria_id: null,
      codigo_barras: step.code,
    };
    if (!payload.nombre) {
      setUi({ msg: "El nombre es requerido", type: "danger" });
      return;
    }
    try {
      const med = await createMedicamento(payload);
      setUi({ msg: "Medicamento creado. Registra la entrada.", type: "success" });
      setStep({ mode: "entrada", code: step.code, med, fromNew: true });
      setEntradaForm({ cantidad: 1, lote: "", caducidad: fechaRef, motivo: "alta inicial" });
    } catch (err) {
      setUi({ msg: err?.response?.data?.error || err?.message || "No se pudo crear el medicamento", type: "danger" });
    }
  }

  // Registrar ENTRADA
  async function onRegistrarEntrada(e) {
    e.preventDefault();
    if (!step?.med?.id) return;
    try {
      const res = await entradaConCaducidad({
        medicamentoId: step.med.id,
        cantidad: Number(entradaForm.cantidad || 1),
        lote: entradaForm.lote || null,
        caducidad: entradaForm.caducidad || null,
        motivo: entradaForm.motivo || null,
      });
      setUi({ msg: `Entrada registrada (stock: ${res?.stock ?? "?"}).`, type: "success" });
      setStep(null);
      await refreshRecent();
    } catch (err) {
      setUi({ msg: err?.response?.data?.error || err?.message || "No se pudo registrar la entrada", type: "danger" });
    }
  }

  // 🔹 Registrar SALIDA
  async function onRegistrarSalida(e) {
    e.preventDefault();
    if (!step?.med?.id) return;
    try {
      const res = await registrarSalida({
        medicamentoId: step.med.id,
        cantidad: Number(salidaForm.cantidad || 1),
        motivo: salidaForm.motivo || "venta",
        documento_ref: salidaForm.documento_ref || null,
      });
      setUi({ msg: `Salida registrada (stock: ${res?.stock ?? "?"}).`, type: "success" });
      setStep(null);
      await refreshRecent();
    } catch (err) {
      setUi({ msg: err?.response?.data?.error || err?.message || "No se pudo registrar la salida", type: "danger" });
    }
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Inventario</h4>
      </div>

      <div className="d-flex align-items-center gap-3 mb-3">
        <BarcodeInput onScan={handleScan} paused={Boolean(step)} />
        <span className="text-muted small">
          Escanea el código y presiona Enter. (El lector se pausa al abrir un formulario)
        </span>
      </div>

      {ui.msg ? <div className={`alert alert-${ui.type} py-2`}>{ui.msg}</div> : null}

      {/* === NUEVO MEDICAMENTO === */}
      {step?.mode === "nuevo" && (
        <div className="card border-success mb-3">
          <div className="card-body">
            <h6 className="card-title mb-1">Nuevo medicamento</h6>
            <div className="text-muted small mb-2">Código escaneado: <code>{step.code}</code></div>

            <form onSubmit={onCreateMedicamento}>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Nombre *</label>
                  <input name="nombre" className="form-control" required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Precio</label>
                  <input name="precio" type="number" step="0.01" className="form-control" placeholder="0.00" />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Fecha de caducidad (referencia)</label>
                  <input name="fecha_caducidad" type="date" className="form-control" />
                </div>
                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <input name="descripcion" className="form-control" placeholder="Opcional" />
                </div>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-success">Crear y continuar</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === ENTRADA === */}
      {step?.mode === "entrada" && step.med && (
        <div className="card border-primary mb-3">
          <div className="card-body">
            <h6 className="card-title mb-1">Entrada de inventario</h6>
            <div className="text-muted small mb-2">
              <strong>{step.med.nombre}</strong>{step.med.codigo_barras ? <> | Código: <code>{step.med.codigo_barras}</code></> : null}
            </div>

            <form onSubmit={onRegistrarEntrada}>
              <div className="row g-2">
                <div className="col-sm-3">
                  <label className="form-label">Cantidad *</label>
                  <input type="number" min="1" className="form-control"
                         value={entradaForm.cantidad}
                         onChange={(e)=>setEntradaForm(f=>({...f,cantidad:e.target.value}))}
                         required />
                </div>
                <div className="col-sm-3">
                  <label className="form-label">Lote</label>
                  <input className="form-control"
                         value={entradaForm.lote}
                         onChange={(e)=>setEntradaForm(f=>({...f,lote:e.target.value}))}/>
                </div>
                <div className="col-sm-3">
                  <label className="form-label">Caducidad</label>
                  <input type="date" className="form-control"
                         value={entradaForm.caducidad}
                         onChange={(e)=>setEntradaForm(f=>({...f,caducidad:e.target.value}))}/>
                </div>
                <div className="col-sm-3">
                  <label className="form-label">Motivo</label>
                  <select className="form-select"
                          value={entradaForm.motivo}
                          onChange={(e)=>setEntradaForm(f=>({...f,motivo:e.target.value}))}>
                    {step?.fromNew && <option value="alta inicial">alta inicial</option>}
                    <option value="compra">compra</option>
                    <option value="ajuste positivo">ajuste positivo</option>
                    <option value="donación">donación</option>
                    <option value="devolución cliente">devolución cliente</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-primary">Registrar entrada</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === SALIDA === */}
      {step?.mode === "salida" && step.med && (
        <div className="card border-danger mb-3">
          <div className="card-body">
            <h6 className="card-title mb-1">Salida de inventario</h6>
            <div className="text-muted small mb-2">
              <strong>{step.med.nombre}</strong>{step.med.codigo_barras ? <> | Código: <code>{step.med.codigo_barras}</code></> : null}
            </div>

            <form onSubmit={onRegistrarSalida}>
              <div className="row g-2">
                <div className="col-sm-3">
                  <label className="form-label">Cantidad *</label>
                  <input type="number" min="1" className="form-control"
                         value={salidaForm.cantidad}
                         onChange={(e)=>setSalidaForm(f=>({...f,cantidad:e.target.value}))}
                         required />
                </div>
                <div className="col-sm-3">
                  <label className="form-label">Motivo</label>
                  <select className="form-select"
                          value={salidaForm.motivo}
                          onChange={(e)=>setSalidaForm(f=>({...f,motivo:e.target.value}))}>
                    <option value="venta">venta</option>
                    <option value="caducidad">caducidad</option>
                    <option value="ajuste negativo">ajuste negativo</option>
                    <option value="donación">donación</option>
                    <option value="devolución a proveedor">devolución a proveedor</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Documento ref. (opcional)</label>
                  <input className="form-control" placeholder="Ticket / Folio / Nota"
                         value={salidaForm.documento_ref}
                         onChange={(e)=>setSalidaForm(f=>({...f,documento_ref:e.target.value}))}/>
                </div>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-danger">Registrar salida</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Últimos movimientos */}
      <div className="mt-4">
        <h6 className="mb-2">Últimos movimientos</h6>
        {!recent.length ? (
          <div className="text-muted small">Sin movimientos todavía.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicamento</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Lote</th>
                  <th>Caducidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.medicamento?.nombre || m.medicamento_id}</td>
                    <td className="text-capitalize">{m.tipo}</td>
                    <td>{m.cantidad}</td>
                    <td>{m.lote || "-"}</td>
                    <td>{m.caducidad ? new Date(m.caducidad).toISOString().slice(0,10) : "-"}</td>
                    <td>{m.created_at ? new Date(m.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabla principal */}
      <InventoryTable onEntrada={handleQuickEntrada} onSalida={handleQuickSalida} />
    </div>
  );
}
