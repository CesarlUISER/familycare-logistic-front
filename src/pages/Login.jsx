import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "../assets/logo.jpg";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthContext } from "../providers/AuthProvider";

export default function Login() {
  const { isAuthenticated, login, loading } = useAuthContext();
  const navigate = useNavigate();

  // Estados controlados
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  // Si ya hay sesión, manda directo al panel
  if (isAuthenticated) return <Navigate to="/app" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await login({ email, password }); // POST /api/auth/login
    if (res.ok) {
      navigate("/app", { replace: true });
    } else {
      setError(res.message || "Credenciales inválidas");
    }
  }

  return (
    <div
      className="d-flex vh-100"
      style={{
        background:
          "linear-gradient(135deg, #004b3c 0%, #00b894 50%, #00d4ff 100%)",
      }}
    >
      {/* Sección izquierda (informativa) */}
      <div
        className="d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5"
        style={{
          width: "45%",
          background:
            "linear-gradient(145deg, rgba(0, 75, 60, 0.95), rgba(0, 184, 148, 0.85), rgba(0, 212, 255, 0.8))",
          borderTopRightRadius: "40px",
          borderBottomRightRadius: "40px",
          boxShadow: "0 0 25px rgba(0,0,0,0.3)",
        }}
      >
        <img
          src={logo}
          alt="Family Care IMS"
          style={{
            width: "130px",
            height: "130px",
            marginBottom: "20px",
            objectFit: "contain",
          }}
        />
        <h2 className="fw-bold text-center">Bienvenido a Family Care IMS</h2>
        <p className="text-center mt-3 px-4" style={{ fontSize: "1rem", color: "#e8f5e9" }}>
          Sistema de gestión de inventario farmacéutico.  
          Ten el control en tus manos.
        </p>
      </div>

      {/* Sección derecha (login form) */}
      <div
        className="d-flex flex-column justify-content-center align-items-center bg-light w-100 p-4"
        style={{
          borderTopLeftRadius: "40px",
          borderBottomLeftRadius: "40px",
          boxShadow: "0 0 25px rgba(0,0,0,0.1)",
        }}
      >
        <div className="card shadow p-4 border-0" style={{ width: "380px" }}>
          <h3 className="text-center mb-4" style={{ color: "#004b3c" }}>
            Iniciar sesión
          </h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-success text-white">
                  <FaUser />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@familycare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text bg-success text-white">
                  <FaLock />
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 mt-2"
              disabled={loading}
              style={{
                background: "linear-gradient(90deg, #009975, #00c896)",
                border: "none",
                color: "#fff",
                fontWeight: "600",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center mt-3" style={{ fontSize: "0.9rem", color: "#6c757d" }}>
            © 2025 Family Care IMS
          </p>
        </div>
      </div>
    </div>
  );
}
