import React, { useState } from 'react';
import Nav from './componentes/nav.js';
import HomePage from './componentes/homepage.jsx'; // 👈 Nuevo componente con los libros recomendados
import './app.css';

// ============== COMPONENTE PRINCIPAL ==============
function App() {
  const [vistaActual, setVistaActual] = useState('login');
  const [usuario, setUsuario] = useState(null);

  const handleLogout = () => {
    setUsuario(null);
    setVistaActual('login');
  };

  const handleNavigate = (vista) => {
    setVistaActual(vista);
  };

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
        setVistaActual('login');
      } else {
        alert('Error al registrarse');
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <div className="App">
      <Nav usuario={usuario} onLogout={handleLogout} onNavigate={handleNavigate} />

      <main className="main">
        {vistaActual === 'login' && (
          <LoginForm onLogin={handleLogin} onGoToRegister={() => setVistaActual('register')} />
        )}

        {vistaActual === 'register' && (
          <RegisterForm onRegister={handleRegister} onGoToLogin={() => setVistaActual('login')} />
        )}

        {vistaActual === 'home' && <HomePage usuario={usuario} />}

        {vistaActual === 'bibliotecas' && usuario && <ListaBiblioteca usuario={usuario} />}

        {vistaActual === 'explorar' && <ExplorarPage />}
      </main>
    </div>
  );
}

export default App;

//
// ================= COMPONENTES SECUNDARIOS =================
//

// 📚 Listado de bibliotecas
function ListaBiblioteca({ usuario }) {
  const [bibliotecas, setBibliotecas] = useState([]);

  React.useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    fetch(`${API_URL}/api/bibliotecas/listar`)
      .then((res) => res.json())
      .then((data) => setBibliotecas(Array.isArray(data) ? data : []))
      .catch((error) => console.error('Error:', error));
  }, []);

  return (
    <div>
      <h2>Mis Bibliotecas</h2>
      {bibliotecas.length === 0 ? (
        <p>No tienes bibliotecas aún. ¡Crea una!</p>
      ) : (
        <ul>
          {bibliotecas.map((b) => (
            <li key={b.id}>
              <h3>{b.nombre}</h3>
              <p>Creador: {b.creador?.username}</p>
              <p>{b.esPublica ? '🌍 Pública' : '🔒 Privada'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 🔎 Página de explorar (puedes ampliar luego)
function ExplorarPage() {
  return (
    <div>
      <h2>Explorar</h2>
      <p>Explora bibliotecas y libros de otros usuarios próximamente...</p>
    </div>
  );
}

// 🔐 Formulario de Login
function LoginForm({ onLogin, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="form-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
      <p>
        ¿No tienes cuenta? <button onClick={onGoToRegister}>Regístrate</button>
      </p>
    </div>
  );
}

// 📝 Formulario de Registro
function RegisterForm({ onRegister, onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(email, username, password);
  };

  return (
    <div className="form-container">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nombre de usuario" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
        <button type="submit">Registrarse</button>
      </form>
      <p>
        ¿Ya tienes cuenta? <button onClick={onGoToLogin}>Inicia sesión</button>
      </p>
    </div>
  );
}
