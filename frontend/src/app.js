// ======================= IMPORTS =======================
// React y useState para manejar estados
import React, { useState } from 'react';

// Componentes principales de la aplicación
import Nav from './componentes/nav.js';
import HomePage from './componentes/homepage.jsx';
import LoginRegister from './componentes/loginregister.jsx';
import AnadirLibro from './componentes/añadir-libro.jsx';
import ExplorarPage from './componentes/explorador.jsx';

// Estilos globales
import './app.css';

// =======================================================
//   COMPONENTE PRINCIPAL DE LA APLICACIÓN
// =======================================================

function App() {

  // vistaActual controla qué pantalla se muestra (login/home/etc)
  const [vistaActual, setVistaActual] = useState('login');

  // usuario contiene información del usuario logueado
  const [usuario, setUsuario] = useState(null);

  // -------------------------------------------------------
  //   Cerrar sesión
  // -------------------------------------------------------
  const handleLogout = () => {
    setUsuario(null);
    setVistaActual('login');
  };

  // -------------------------------------------------------
  //   Cambiar de pantalla manualmente
  // -------------------------------------------------------
  const handleNavigate = (vista) => {
    setVistaActual(vista);
  };

  // -------------------------------------------------------
  //   LOGIN DE USUARIO
  // -------------------------------------------------------
  const handleLogin = async (email, password) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardamos usuario y pasamos a la pantalla HOME
        setUsuario(data.usuario);
        setVistaActual('home');
        alert('Login exitoso');
      } else {
        alert('Error en el login');
      }

    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error de conexión con el servidor');
    }
  };

  // -------------------------------------------------------
  //   REGISTRO DE USUARIO
  // -------------------------------------------------------
  const handleRegister = async (email, username, password) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión');
      } else {
        alert('Error al registrarse');
      }

    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  // =======================================================
  //   RENDER DE LA APLICACIÓN
  // =======================================================
  return (
    <div className="App">

      {/* Barra de navegación superior */}
      <Nav
        usuario={usuario}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {/* Contenedor principal */}
      <main className={`main ${vistaActual === 'login' ? 'modo-login' : ''}`}>

        {/* Pantalla LOGIN / REGISTRO */}
        {vistaActual === 'login' && (
          <LoginRegister
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}

        {/* Pantalla HOME */}
        {vistaActual === 'home' && usuario && (
          <HomePage usuario={usuario} />
        )}

        {/* Lista de Bibliotecas */}
        {vistaActual === 'bibliotecas' && usuario && (
          <ListaBiblioteca usuario={usuario} />
        )}

        {/* Añadir libro */}
        {vistaActual === 'añadir-libro' && usuario && (
          <AnadirLibro usuario={usuario} />
        )}

        {/* Página de exploración */}
        {vistaActual === 'explorar' && <ExplorarPage />}

      </main>

    </div>
  );
}

export default App;
