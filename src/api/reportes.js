import client from "./client";

export async function getReporteMensual(mes) {
  const { data } = await client.get("/reportes/mensual", { params: { mes } });
  return data;
}

export async function getInventarioActual(params) {
  const { data } = await client.get("/reportes/stock", { params });
  return data;
}
