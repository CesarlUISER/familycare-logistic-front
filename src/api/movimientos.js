import client from "./client";

/** ENTRADA con lote/caducidad (ya lo tienes) */
export async function entradaConCaducidad(payload) {
  const { medicamentoId, cantidad, lote, caducidad, motivo, documento_ref } = payload;
  const { data } = await client.post("/movimientos", {
    medicamento_id: medicamentoId,
    tipo: "entrada",
    cantidad,
    motivo: motivo || "compra",
    documento_ref: documento_ref || null,
    lote: lote || null,
    caducidad: caducidad || null,
  });
  return data?.medicamento || data;
}

/** 🔹 SALIDA básica (venta / caducidad / ajuste negativo) */
export async function registrarSalida({ medicamentoId, cantidad, motivo, documento_ref }) {
  const { data } = await client.post("/movimientos", {
    medicamento_id: medicamentoId,
    tipo: "salida",
    cantidad,
    motivo: motivo || "venta",
    documento_ref: documento_ref || null,
  });
  return data?.medicamento || data;
}

/** Últimos movimientos (opcional, ya lo usas) */
export async function listarMovimientos(params = {}) {
  const { data } = await client.get("/movimientos", { params });
  return data;
}

/** Wrapper para mantener compatibilidad con código antiguo */
export async function salidaPorCaducidad({ medicamentoId, cantidad, documento_ref }) {
  // Usa registrarSalida con motivo fijo 'caducidad'
  return registrarSalida({
    medicamentoId,
    cantidad,
    motivo: "caducidad",
    documento_ref: documento_ref || null,
  });
}