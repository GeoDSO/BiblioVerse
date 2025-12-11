import './nav.css';

function Nav({ usuario, onLogout, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo" onClick={() => onNavigate('home')}>
          Biblioverse
        </div>

        <ul className="nav-menu">
          {usuario ? (
            <>
              <li onClick={() => onNavigate('home')}>Inicio</li>
              <li onClick={() => onNavigate('explorador')}>Explorar</li>
              <li onClick={() => onNavigate('añadir-libro')}>Añadir Libros</li>
              <li onClick={() => onNavigate('perfilpage')}>Perfil</li>
              <li className="nav-user">
                <span>👤 {usuario.username}</span>
                <button onClick={onLogout} className="btn-logout">
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li onClick={() => onNavigate('login')}>Iniciar Sesión</li>
              <li onClick={() => onNavigate('register')}>Registrarse</li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
