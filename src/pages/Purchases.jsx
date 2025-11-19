// frontend/src/pages/Purchases.jsx
import React, { useState } from "react";
import BarcodeInput from "../components/BarcodeInput";
import { registrarEntradaPorCodigo } from "../api/movimientos";

export default function Purchases() {
  const [codigoBarras, setCodigoBarras] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [lote, setLote] = useState("");
  const [caducidad, setCaducidad] = useState(""); // YYYY-MM-DD
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleScan = (code) => {
    setCodigoBarras(code);
    setMensaje(`Código escaneado: ${code}`);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!codigoBarras) {
      setError("Escanea primero un código de barras.");
      return;
    }
    if (!cantidad || Number(cantidad) <= 0) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }

    try {
      setLoading(true);

      const resp = await registrarEntradaPorCodigo({
        codigo_barras: codigoBarras,
        cantidad,
        lote,
        caducidad,
        motivo,
      });

      setMensaje(
        `Entrada registrada correctamente. Stock actual: ${
          resp?.medicamento?.stock ?? "?"
        }`
      );
      setError("");

      // dejamos el código por si quieres repetir entrada del mismo producto
      setCantidad(1);
      setLote("");
      setCaducidad("");
      // setCodigoBarras(""); // si prefieres limpiar también el código, descomenta
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        "Error al registrar la entrada. Revisa el código de barras.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Compras (entradas de stock)</h1>
      <p>
        Escanea el código de barras del medicamento, indica la cantidad,
        opcionalmente el lote y la fecha de caducidad, y registra la entrada.
      </p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 600, marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            Escanea el código de barras
          </label>
          <BarcodeInput
            onScan={handleScan}
            placeholder="Escanea y presiona Enter..."
          />
          {codigoBarras && (
            <small style={{ display: "block", marginTop: 4 }}>
              Código actual: <strong>{codigoBarras}</strong>
            </small>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Cantidad</label>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Lote</label>
          <input
            type="text"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
            placeholder="Ej: L-2025-01"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            Fecha de caducidad
          </label>
          <input
            type="date"
            value={caducidad}
            onChange={(e) => setCaducidad(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            Motivo (opcional)
          </label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="compra, ajuste, donación..."
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar entrada"}
        </button>
      </form>

      {mensaje && (
        <div
          style={{
            marginTop: 16,
            padding: 10,
            backgroundColor: "#d4edda",
            borderRadius: 4,
          }}
        >
          {mensaje}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 10,
            backgroundColor: "#f8d7da",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
