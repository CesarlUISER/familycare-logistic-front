// src/api/movimientos.js
import client from "./client";

// =========================
// LISTAR MOVIMIENTOS
// =========================
export async function listarMovimientos(params = {}) {
  const res = await client.get("/movimientos", { params });
  return res.data;
}

// =========================
// ENTRADA POR CÓDIGO
// =========================
// payload esperado:
// {
//   codigo_barras: string,
//   cantidad?: number,
//   lote?: string,
//   caducidad?: string (YYYY-MM-DD),
//   motivo?: string,
//   documento_ref?: string
// }
export async function crearMovimientoEntradaPorCodigo(payload) {
  const res = await client.post("/movimientos", {
    ...payload,
    tipo: "entrada",
  });
  return res.data;
}

// =========================
// SALIDA POR CÓDIGO
// =========================
export async function crearMovimientoSalidaPorCodigo(payload) {
  const res = await client.post("/movimientos", {
    ...payload,
    tipo: "salida",
  });
  return res.data;
}

// =========================
// ALIAS para no romper código viejo
// =========================

// Antes usabas entradaConCaducidad -> ahora apunta a la misma función
export const entradaConCaducidad = crearMovimientoEntradaPorCodigo;

// Antes usabas registrarSalida -> ahora apunta a la de salida
export const registrarSalida = crearMovimientoSalidaPorCodigo;

// Antes usabas salidaPorCaducidad en Expirations
// De momento, se comporta igual que una salida normal.
// Más adelante podemos hacer endpoint especial si lo necesitas.
export async function salidaPorCaducidad(payload) {
  return crearMovimientoSalidaPorCodigo(payload);
}
