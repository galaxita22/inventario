import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Agrega esta importación
import Sidebar from './components/Sidebar'; // Agrega esta importación

export default function App() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState({
    isLoggedIn: Boolean(localStorage.getItem('token')),
    userRole: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).role : null,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ isLoggedIn: false, userRole: null });
    navigate('/', { replace: true });
  };

  return (
    <div className="layout-principal">
      <Sidebar 
        isLoggedIn={auth.isLoggedIn} 
        userRole={auth.userRole} 
        onLogout={handleLogout} 
      />
    <main className="contenido-derecho">
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          !auth.isLoggedIn 
            ? <LoginPage setAuth={setAuth} /> 
            : <Navigate to="/dashboard" replace />
        } 
      />
      
      {/* Ruta Protegida del Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          auth.isLoggedIn 
            ? <DashboardPage /> 
            : <Navigate to="/login" replace />
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </main>
    </div>
  );
}