// frontend/src/layouts/DashboardLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../providers/AuthProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css"; // asegúrate de importar donde tengas los estilos

export default function DashboardLayout() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell d-flex">
      {/* Sidebar sticky con su propio scroll */}
      <aside className="app-aside d-flex flex-column p-3 border-end">
        <h5 className="mb-4">Family Care IMS</h5>

        <nav className="nav nav-pills flex-column gap-2">
          <NavLink to="/app" end className="nav-link">Dashboard</NavLink>
          <NavLink to="/app/inventory" className="nav-link">Inventario</NavLink>
          <NavLink to="/app/suppliers" className="nav-link">Proveedores</NavLink>
          <NavLink to="/app/sales" className="nav-link">Ventas (POS)</NavLink>
          <NavLink to="/app/purchases" className="nav-link">Compras</NavLink>
          <NavLink to="/app/expirations" className="nav-link">Caducidades</NavLink>
          <NavLink to="/app/reports" className="nav-link">Reportes</NavLink>
          <NavLink to="/app/users" className="nav-link">Usuarios</NavLink>
          <NavLink to="/app/settings" className="nav-link">Ajustes</NavLink>
        </nav>

        <div className="mt-auto">
          <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main scrollable */}
      <main className="app-main flex-grow-1">
        {/* Header pegajoso (no tapa el scroll) */}
        <div className="app-header d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white">
          <h6 className="m-0 text-secondary">Panel</h6>
        </div>

        <div className="app-main-content p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
