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
              <li onClick={() => onNavigate('bibliotecas')}>Mis Bibliotecas</li>
              <li onClick={() => onNavigate('explorar')}>Explorar</li>
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
