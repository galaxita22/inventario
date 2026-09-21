import "../styles/ModalPrimerLogin.css";

interface ModalPrimerLoginProps {
    onClose: () => Promise<void>;
}

export default function ModalPrimerLogin({
    onClose,
}: ModalPrimerLoginProps) {
    return (
        <div className="first-login-overlay">
            <div className="first-login-modal">
                <div className="first-login-icon">
                    🔐
                </div>
                <h2>Bienvenido al sistema</h2>
                <p>
                    Tu cuenta fue creada por un administrador del sistema.
                </p>
                <p>
                    La contraseña que recibiste fue generada automáticamente y podría ser conocida por otras personas autorizadas para crear cuentas.
                </p>
                <p>
                    Por motivos de seguridad, te recomendamos cambiar tu contraseña lo antes posible desde tu perfil.
                </p>
                <div className="first-login-warning">
                    Esta notificación solo será mostrada una vez.
                </div>
                <button className="first-login-btn" onClick={onClose}>Entendido</button>
            </div>
        </div>
    );
}