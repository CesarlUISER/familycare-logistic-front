// frontend/src/pages/Reports.jsx
import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getReporteMensual, getInventarioActual } from "../api/reportes";

export default function Reports() {
  const printRef = React.useRef(null);

  // ---- Estado: reporte mensual ----
  const [mes, setMes] = React.useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // ---- Estado: inventario actual (listado que muestras abajo) ----
  const [stock, setStock] = React.useState({
    rows: [],
    page: 1,
    limit: 20,
    total: 0,
  });
  const [loadingStock, setLoadingStock] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [limit, setLimit] = React.useState(20);
  const [sort, setSort] = React.useState("nombre"); // nombre | stock | precio | fecha_caducidad
  const [order, setOrder] = React.useState("ASC");

  // ---- UI simple ----
  const [ui, setUi] = React.useState({ msg: "", type: "info" });

  // Helpers seguros (evitar mezclas de ?? con ||)
  const safeNum = (v, d = 0) => (v === undefined || v === null ? d : Number(v));

  // ====== Cargar reporte mensual ======
  const cargarMensual = async () => {
    try {
      setLoading(true);
      setUi({ msg: "", type: "info" });
      const res = await getReporteMensual(mes);
      setData(res || {});
    } catch (err) {
      console.error("Reporte mensual error:", err);
      setUi({ msg: "No se pudo cargar el reporte mensual.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // ====== Cargar inventario actual ======
  const cargarStock = async () => {
    try {
      setLoadingStock(true);
      const res = await getInventarioActual({
        q,
        page: 1,
        limit,
        sort,
        order,
      });

      setStock({
        rows: Array.isArray(res?.data) ? res.data : [],
        page: res && res.page != null ? res.page : 1,
        limit: res && res.limit != null ? res.limit : (Number(limit) || 20),
        total: res && res.total != null ? res.total : 0,
      });
    } catch (err) {
      console.error("Stock actual error:", err);
      setStock({ rows: [], page: 1, limit: Number(limit) || 20, total: 0 });
      setUi({ msg: "No se pudo cargar el inventario actual.", type: "danger" });
    } finally {
      setLoadingStock(false);
    }
  };

  React.useEffect(() => {
    cargarMensual();
    cargarStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== Descargar PDF con html2canvas + jsPDF ======
  const handleDownloadPDF = async () => {
    try {
      const node = printRef.current;
      if (!node) return;

      // Captura del contenedor (doble escala para mejor nitidez)
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      // Documento A4 vertical
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const imgW = pdfW;
      const imgH = (canvas.height * imgW) / canvas.width;

      // Primera página
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);

      // Si la imagen es más alta que una página, agregar páginas y “desplazar” la imagen
      let heightLeft = imgH - pdfH;
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft * -1; // mover hacia arriba
        pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
        heightLeft -= pdfH;
      }

      const mm = data?.mes || new Date().toISOString().slice(0, 7);
      pdf.save(`reporte-${mm}.pdf`);
    } catch (e) {
      console.error("Error generando PDF:", e);
      setUi({ msg: "No se pudo generar el PDF.", type: "danger" });
    }
  };

  // ====== Render ======
  const resumen = data?.resumen || {};

  return (
    <div className="container-fluid p-0" ref={printRef}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Reportes</h4>
        <div className="d-flex gap-2">
          <input
            type="month"
            className="form-control form-control-sm"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            style={{ width: 170 }}
          />
          <button
            className="btn btn-sm btn-primary"
            onClick={cargarMensual}
            disabled={loading}
          >
            Actualizar
          </button>
          <button
            className="btn btn-sm btn-success"
            onClick={handleDownloadPDF}
            disabled={loading || loadingStock}
          >
            Descargar PDF
          </button>
        </div>
      </div>

      {ui.msg ? (
        <div className={`alert alert-${ui.type} py-2`}>{ui.msg}</div>
      ) : null}

      {/* ===== KPIs / tarjetas ===== */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Medicamentos activos</div>
              <div className="fs-4 fw-semibold">
                {safeNum(resumen.totalMedicamentos, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Stock total</div>
              <div className="fs-4 fw-semibold">
                {safeNum(resumen.totalStock, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Entradas</div>
              <div className="fs-4 fw-semibold">
                {safeNum(resumen.entradas, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Salidas</div>
              <div className="fs-4 fw-semibold">
                {safeNum(resumen.salidas, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-danger">
            <div className="card-body">
              <div className="text-muted small">Caducidades</div>
              <div className="fs-4 fw-semibold text-danger">
                {safeNum(resumen.caducidades, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-danger">
            <div className="card-body">
              <div className="text-muted small">Pérdida por caducidad</div>
              <div className="fs-4 fw-semibold text-danger">
                $
                {Number(resumen.perdidaTotal || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Top 5 ===== */}
      <div className="card mt-4">
        <div className="card-body">
          <h6 className="mb-2">Top 5 con más movimientos</h6>
          {!data?.top?.length ? (
            <div className="text-muted small">Sin datos.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Total movimientos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top.map((r, i) => (
                    <tr key={i}>
                      <td>{r?.medicamento?.nombre || `#${r.medicamento_id}`}</td>
                      <td>{safeNum(r?.total_movimientos, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===== Inventario actual (filtros básicos + tabla compacta) ===== */}
      <div className="card mt-4 mb-4">
        <div className="card-body">
          <h6 className="mb-3">Inventario actual</h6>

          <div className="row g-2 align-items-center mb-2">
            <div className="col-sm-6 col-md-4">
              <input
                className="form-control"
                placeholder="Buscar (nombre / código)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="col-sm-6 col-md-2">
              <input
                className="form-control"
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 10)}
              />
            </div>
            <div className="col-sm-6 col-md-3">
              <select
                className="form-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="nombre">Orden: Nombre</option>
                <option value="stock">Orden: Stock</option>
                <option value="precio">Orden: Precio</option>
                <option value="fecha_caducidad">Orden: Caducidad</option>
              </select>
            </div>
            <div className="col-sm-6 col-md-2">
              <select
                className="form-select"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                <option value="ASC">ASC</option>
                <option value="DESC">DESC</option>
              </select>
            </div>
            <div className="col-sm-6 col-md-1 d-grid">
              <button
                className="btn btn-primary"
                onClick={cargarStock}
                disabled={loadingStock}
              >
                Aplicar
              </button>
            </div>
          </div>

          {!stock.rows.length ? (
            <div className="text-muted small">Sin resultados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th className="text-end">Stock</th>
                    <th className="text-end">Precio</th>
                    <th>Caducidad (ref.)</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.nombre}</td>
                      <td>{r.codigo_barras || "—"}</td>
                      <td className="text-end">{safeNum(r.stock, 0)}</td>
                      <td className="text-end">
                        ${Number(r.precio || 0).toFixed(2)}
                      </td>
                      <td>
                        {r.fecha_caducidad
                          ? new Date(r.fecha_caducidad).toISOString().slice(0, 10)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(loading || loadingStock) && (
            <div className="mt-2 small text-muted">Cargando…</div>
          )}
        </div>
      </div>
    </div>
  );
}
