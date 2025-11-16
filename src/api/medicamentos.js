import client from "./client";

/** 🔎 Buscar un medicamento por código de barras */
export async function getByBarcode(code) {
  const { data } = await client.get(`/medicamentos/by-barcode/${code}`);
  return data;
}

/** ➕ Crear un medicamento (alta en catálogo) */
export async function createMedicamento(payload) {
  const { data } = await client.post(`/medicamentos`, payload);
  return data;
}

/** 📋 Listado paginado de medicamentos (buscar/ordenar) */
export async function listMedicamentos({
  q = "",
  page = 1,
  limit = 10,
  sort = "nombre",
  order = "ASC",
  min_stock,
  max_stock,
} = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("sort", sort);
  params.set("order", order);
  if (min_stock !== undefined) params.set("min_stock", String(min_stock));
  if (max_stock !== undefined) params.set("max_stock", String(max_stock));

  const { data } = await client.get(`/medicamentos?${params.toString()}`);
  // backend devuelve: { page, limit, total, pages, data }
  return data;
}

// Alertas de caducidad y stock bajo
export async function getAlertas({ dias = 60, stock = 20 } = {}) {
  const params = new URLSearchParams({ dias: String(dias), stock: String(stock) });
  const { data } = await client.get(`/medicamentos/alertas/listado?${params.toString()}`);
  // { por_caducar: [], stock_bajo: [] }
  return data;
}

export async function updateBarcode(id, codigo_barras) {
  const { data } = await client.patch(`/medicamentos/${id}/barcode`, { codigo_barras });
  return data;
}
