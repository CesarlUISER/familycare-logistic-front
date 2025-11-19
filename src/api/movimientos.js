// frontend/src/api/movimientos.js
import client from "./client";

// 👉 Entrada de stock usando código de barras
export async function registrarEntradaPorCodigo({
  codigo_barras,
  cantidad,
  lote,
  caducidad,
  motivo,
}) {
  const payload = {
    codigo_barras,
    tipo: "entrada",                 // el backend lo usa para saber que es ENTRADA
    cantidad: Number(cantidad),
    lote: lote || undefined,
    caducidad: caducidad || undefined, // YYYY-MM-DD
    motivo: motivo || "compra",
  };

  const resp = await client.post("/movimientos", payload);
  return resp.data; // { ok: true, movimiento, medicamento, lote }
}

// 👉 Salida de stock usando código de barras (la usaremos en Ventas.jsx)
export async function registrarSalidaPorCodigo({
  codigo_barras,
  cantidad,
  motivo,
}) {
  const payload = {
    codigo_barras,
    tipo: "salida",
    cantidad: Number(cantidad),
    motivo: motivo || "venta",
  };

  const resp = await client.post("/movimientos", payload);
  return resp.data;
}

// 👉 Listar movimientos (para la pantalla de Reportes)
function toSQLDate(fecha) {
  if (!fecha) return null;
  const [dia, mes, anio] = fecha.split("/");
  return `${anio}-${mes}-${dia}`;
}

export async function listarMovimientos({ tipo, desde, hasta }) {
  const resp = await client.get("/movimientos", {
    params: {
      tipo,
      desde: toSQLDate(desde),
      hasta: toSQLDate(hasta)
    }
  });

  return resp.data?.data || [];
}

