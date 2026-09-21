import React from "react";
import "../index.css";
import "../styles/Style-footer.css";

const logoFacultad = new URL('../assets/logo_facultad_grande.png', import.meta.url).href;

const Footer: React.FC = () => {
  return (
    <footer className="footer-institucional">
      <div className="footer-info">
        <p className="footer-copyright">
          © {new Date().getFullYear()} <strong>Facultad de Ingeniería</strong> - Universidad de Talca.
        </p>
        <div className="footer-links">
          <span>Soporte Técnico: </span>
          <a href="mailto:felipe.gonzalez@utalca.cl">felipe.gonzalez@utalca.cl</a>
          <span className="separador">•</span>
          <a href="mailto:alonso.lobos@utalca.cl">alonso.lobos@utalca.cl</a>
        </div>
      </div>
      
      <div className="footer-logo-container">
        <div>
        <a 
          href="https://ingenieria.utalca.cl" 
          target="_blank"           // Abre la página en una pestaña nueva
          rel="noopener noreferrer" // Medida de seguridad esencial en React
        >
          <img 
            src={logoFacultad} 
            alt="Logo Facultad de Ingeniería"
            style={{ 
              height: '60px', 
              cursor: 'pointer',     // Para que el mouse cambie a "manito"
              transition: 'transform 0.2s' // Un toque extra de suavidad
            }} 
            className="footer-logo-link"
          />
        </a>
      </div>
      </div>
    </footer>
  );
};

export default Footer;