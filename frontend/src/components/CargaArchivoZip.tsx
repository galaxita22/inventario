// components/CargaArchivoZip.tsx
import { useState } from "react";
import type { DragEvent, ChangeEvent } from "react"; 
import axios from "axios";

//tazas de cafe: 8
//plegarias: 4
//colapsos nerviosos: 2
//exorcismos: 3
//teclados nuevos: 1 

interface CargaArchivoZipProps {
  onUploadSuccess: () => void;
}

export default function CargaArchivoZip({ onUploadSuccess }: CargaArchivoZipProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [progreso, setProgreso] = useState("");

  /*
  useEffect(() => {
    const ignorarAccionNativa = (e: globalThis.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("dragover", ignorarAccionNativa);
    window.addEventListener("drop", ignorarAccionNativa);

    return () => {
      window.removeEventListener("dragover", ignorarAccionNativa);
      window.removeEventListener("drop", ignorarAccionNativa);
    };
  }, []);
*/
const handleDrag = (e: DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(e.type === "dragenter" || e.type === "dragover");
};

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      const esZip = file.name.toLowerCase().endsWith(".zip");

      if (esZip) {
        setArchivo(file);
      } else {
        setError("Por favor, sube solo archivos con extensión .zip");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith(".zip")) {
        setArchivo(file);
      } else {
        setError("Por favor, selecciona solo archivos con extensión .zip");
      }
    }
  };

const handleSubmit = async () => {
    if (!archivo) return;

    setSubiendo(true);
    setError("");
    setProgreso("Subiendo y procesando imágenes en el servidor...");

    const formData = new FormData();
    formData.append("archivoZip", archivo); 
    try {
      const response = await axios.post("http://localhost:3000/api/component/import-zip", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
          "Content-Type": "multipart/form-data",
        },
      });

      alert(`Archivo subido y procesado exitosamente: ${response.data.message}`);
      setArchivo(null);
      onUploadSuccess(); 
    } catch (err: any) {
      const mensaje = err.response?.data?.error || "Error al conectar con el servidor.";
      setError(mensaje);
    } finally {
      setSubiendo(false);
      setProgreso("");
    }
  };

  return (
    <section 
      className="card-inventario" 
      style={{ 
        padding: "40px", 
        marginTop: "20px", 
        textAlign: "center",
        backgroundColor: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "8px"
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <h2 style={{ color: "#333333", marginBottom: "10px" }}>Arrastrar archivo comprimido</h2>
      <p style={{ color: "#666666", margin: "0 0 20px 0" }}>
        El archivo debe contener la carpeta "Imagenes" (con fotos en extensión fija) y el archivo Excel.
      </p>

      {/* Zona Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive ? "2px dashed #28a745" : "2px dashed #007bff",
          borderRadius: "8px",
          padding: "60px 20px",
          backgroundColor: dragActive ? "#f4fdf6" : "#f8f9fa",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        {archivo ? (
          <div>
            <p style={{ fontWeight: "bold", color: "#28a745" }}>📦 Archivo cargado:</p>
            <p style={{ fontSize: "1.1rem", color: "#333333" }}>{archivo.name} ({(archivo.size / (1024 * 1024)).toFixed(2)} MB)</p>
          </div>
        ) : (
          <div>
            <p style={{ color: "#333333", margin: "0 0 8px 0" }}>Suelte su archivo .zip aquí o</p>
            <label style={{ color: "#0056b3", textDecoration: "underline", cursor: "pointer", display: "inline-block", fontWeight: "bold" }}>
              haga clic aquí para buscar en su equipo
              <input type="file" accept=".zip" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          </div>
        )}
      </div>

      {error && <p style={{ color: "#dc3545", marginTop: "15px", fontWeight: "bold" }}>{error}</p>}
      {progreso && <p style={{ color: "#007bff", marginTop: "15px" }}>{progreso}</p>}

      {/* Botón de envío */}
      {archivo && !subiendo && (
        <button
          onClick={handleSubmit}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem"
          }}
        >
          Iniciar Importación de Productos
        </button>
      )}

      {subiendo && (
        <button disabled style={{ marginTop: "20px", padding: "12px 24px", backgroundColor: "#ccc", color: "#666", border: "none", borderRadius: "6px" }}>
          Subiendo y procesando...
        </button>
      )}
    </section>
  );
}
