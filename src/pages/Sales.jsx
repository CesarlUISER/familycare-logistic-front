// frontend/src/pages/Sales.jsx
import React, { useState } from "react";
import BarcodeInput from "../components/BarcodeInput";
import { registrarSalidaPorCodigo } from "../api/movimientos";

export default function Sales() {
  const [codigoBarras, setCodigoBarras] = useState("");
  const [cantidad, setCantidad] = useState(1);
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

      const resp = await registrarSalidaPorCodigo({
        codigo_barras: codigoBarras,
        cantidad,
        motivo,
      });

      setMensaje(
        `Salida registrada correctamente. Stock actual: ${
          resp?.medicamento?.stock ?? "?"
        }`
      );
      setError("");

      setCantidad(1);
      // puedes limpiar el código si quieres:
      // setCodigoBarras("");
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        "Error al registrar la salida. Revisa el código de barras o el stock.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Ventas (salidas de stock)</h1>
      <p>
        Escanea el código de barras del medicamento vendido y registra la
        salida. El sistema descuenta automáticamente del lote correcto usando FEFO.
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
          <label style={{ display: "block", marginBottom: 4 }}>
            Motivo (opcional)
          </label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="venta, ajuste..."
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar salida"}
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
