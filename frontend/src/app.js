import React, { useState } from 'react';
import Nav from './componentes/nav.js';
import HomePage from './componentes/homepage.jsx'; 
import LoginRegister from './componentes/loginregister.jsx';
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

      <main className={`main ${vistaActual === 'login' ? 'modo-login' : ''}`}>
        {vistaActual === 'login' && (
          <LoginRegister 
            onLogin={handleLogin} 
            onRegister={handleRegister}
          />
        )}

        {vistaActual === 'home' && <HomePage usuario={usuario} />}

        {vistaActual === 'bibliotecas' && usuario && <ListaBiblioteca usuario={usuario} />}

        {vistaActual === 'añadir-libros' && usuario && <AnadirLibros usuario={usuario} />}

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

// 🔎 Página de explorar
function ExplorarPage() {
  return (
    <div>
      <h2>Explorar</h2>
      <p>Explora bibliotecas y libros de otros usuarios próximamente...</p>
    </div>
  );
}

// 📖 Componente para añadir libros
function AnadirLibros({ usuario }) {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [isbn, setIsbn] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/api/libros/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          titulo, 
          autor, 
          isbn, 
          usuarioId: usuario.id 
        }),
      });

      if (response.ok) {
        alert('¡Libro añadido exitosamente!');
        setTitulo('');
        setAutor('');
        setIsbn('');
      } else {
        const errorData = await response.json();
        alert(`Error al añadir el libro: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    }
  };

  return (
    <div className="anadir-libros-container">
      <h2>📖 Añadir Nuevo Libro</h2>
      <form onSubmit={handleSubmit} className="form-libro">
        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            placeholder="Ingresa el título del libro"
          />
        </div>
        <div className="form-group">
          <label>Autor:</label>
          <input
            type="text"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            required
            placeholder="Ingresa el autor"
          />
        </div>
        <div className="form-group">
          <label>ISBN:</label>
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="Ingresa el ISBN (opcional)"
          />
        </div>
        <button type="submit" className="btn-submit">
          Añadir Libro
        </button>
      </form>
    </div>
  );
}