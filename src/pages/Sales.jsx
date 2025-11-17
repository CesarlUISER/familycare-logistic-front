// src/pages/Sales.jsx
import React, { useState } from "react";
import BarcodeInput from "../components/BarcodeInput";
import { crearMovimientoSalidaPorCodigo } from "../api/movimientos";

export default function Sales() {
  const [form, setForm] = useState({
    codigo_barras: "",
    cantidad: 1,
    motivo: "venta",
    documento_ref: "",
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [detalle, setDetalle] = useState(null);

  const handleScan = (code) => {
    setForm((prev) => ({ ...prev, codigo_barras: code }));
    setMensaje(`Código escaneado: ${code}`);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMensaje(null);
    setDetalle(null);

    try {
      const payload = {
        codigo_barras: form.codigo_barras.trim(),
        cantidad: Number(form.cantidad) || 1,
        motivo: form.motivo.trim() || undefined,
        documento_ref: form.documento_ref.trim() || undefined,
      };

      const data = await crearMovimientoSalidaPorCodigo(payload);

      setMensaje("✅ Salida registrada correctamente");
      setDetalle(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Error al registrar la salida. Revisa el backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Salidas de medicamentos</h2>
      <p className="text-muted">
        Escanea el código de barras de cada caja que salga y registra la
        cantidad.
      </p>

      <div className="mb-3">
        <label className="form-label">Escáner de código de barras</label>
        <BarcodeInput
          onScan={handleScan}
          placeholder="Escanea el código y presiona Enter"
          className="form-control"
        />
      </div>

      <form onSubmit={handleSubmit} className="card p-3">
        <div className="mb-3">
          <label className="form-label">Código de barras</label>
          <input
            type="text"
            className="form-control"
            name="codigo_barras"
            value={form.codigo_barras}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row">
          <div className="mb-3 col-md-4">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              className="form-control"
              name="cantidad"
              min={1}
              value={form.cantidad}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 col-md-8">
            <label className="form-label">Motivo</label>
            <input
              type="text"
              className="form-control"
              name="motivo"
              value={form.motivo}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Documento / Ticket (opcional)</label>
          <input
            type="text"
            className="form-control"
            name="documento_ref"
            value={form.documento_ref}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar salida"}
        </button>
      </form>

      {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {detalle && (
        <div className="card mt-3 p-3">
          <h5>Resultado</h5>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(detalle, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
