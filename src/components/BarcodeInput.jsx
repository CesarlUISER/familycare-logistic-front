// frontend/src/components/BarcodeInput.jsx
import React, { useState, useEffect, useRef } from "react";

/**
 * Componente para leer código de barras con pistolita (o teclado).
 * - La pistolita escribe los números y manda "Enter".
 * - Al presionar Enter, se dispara onScan(codigo).
 */
export default function BarcodeInput({
  onScan,
  placeholder = "Escanea el código de barras...",
  autoFocus = true,
  className = "",
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  // Opcional: auto-focus para que siempre esté listo para escanear
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = value.trim();
      if (!code) return;

      // Disparamos el callback
      onScan?.(code);

      // Limpiamos el input para el siguiente escaneo
      setValue("");

      // Volvemos a enfocar
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className || "form-control"}
    />
  );
}
