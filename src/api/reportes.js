// frontend/src/api/reportes.js
import client from "./client";

// Inventario actual (todos los medicamentos con su stock)
export async function getInventarioActual() {
  const resp = await client.get("/reportes/stock");
  return resp.data?.data || [];
}
// Reporte mensual (si lo usas más adelante)
export async function getReporteMensual({ anio, mes }) {
  const resp = await client.get("/reportes/mensual", {
    params: { anio, mes },
  });

  // Devolvemos lo que venga, luego lo adaptamos en la pantalla de reportes
  return resp.data;
}

export async function getExpirations() {
  const resp = await client.get("/reportes/expirations");
  
  return resp.data?.data || [];
}
