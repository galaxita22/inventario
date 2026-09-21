import { useState } from "react";

interface ModalCambiarFotoProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess: () => void;
  hasAvatar: boolean;
}

export default function ModalCambioFoto({ isOpen, onClose, userId, onSuccess, hasAvatar }: ModalCambiarFotoProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      // FormData es obligatorio para enviar archivos
      const formData = new FormData();
      formData.append("imagen", selectedFile);

      const response = await fetch(`${apiUrl}/api/accounts/${userId}/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // NO pongas Content-Type aquí, el navegador lo asigna solo
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al subir imagen");
      }

      onSuccess(); // Refresca los datos del padre
      onClose();   // Cierra el modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar tu foto de perfil?");
    if (!confirmar) return;

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(`${apiUrl}/api/accounts/${userId}/avatar`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar imagen");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-card">
        <div className="profile-modal-header">
          <h2>Foto de Perfil</h2>
          <button className="profile-modal-close" onClick={onClose}>✖</button>
        </div>
        
        <form onSubmit={handleAvatarSubmit} className="profile-modal-form">
          <p className="profile-modal-instruction">
            Sube una imagen para tu perfil. Se verá en la lista de cuentas y en tus solicitudes.
          </p>

          {error && <div className="profile-modal-error">{error}</div>}

          <div className="profile-file-dropzone">
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileChange}
              className="profile-file-input-hidden"
            />
            <label htmlFor="avatar-upload" className="profile-file-label">
              {previewUrl ? (
                <div className="profile-preview-wrapper">
                  <img src={previewUrl} alt="Vista previa" className="profile-preview-img" />
                  <div className="profile-preview-overlay">Cambiar foto</div>
                </div>
              ) : (
                <div className="profile-upload-placeholder">
                  <span className="upload-icon">⬆️</span>
                  <strong>Haz clic para buscar</strong>
                  <small>JPG, PNG o WEBP (Max. 5MB)</small>
                </div>
              )}
            </label>
          </div>

          <div className="profile-modal-actions">
            {/* Botón de eliminar, alineado a la izquierda para separarlo de los otros */}
            {hasAvatar && (
              <button 
                type="button" 
                className="profile-btn-cancel" 
                style={{ marginRight: 'auto', color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }} 
                onClick={handleAvatarDelete} 
                disabled={uploading}
              >
                Eliminar foto actual
              </button>
            )}
            
            <button type="button" className="profile-btn-cancel" onClick={onClose} disabled={uploading}>
              Cancelar
            </button>
            <button type="submit" className="profile-btn-submit" disabled={uploading || !selectedFile}>
              {uploading ? "Procesando..." : "Guardar foto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}