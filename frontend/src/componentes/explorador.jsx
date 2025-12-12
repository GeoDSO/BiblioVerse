import React, { useState, useEffect } from 'react';
import './explorador.css';
import LectorLibro from './lectorlibro';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

function ExploradorLibros({ usuario }) {
  const [libros, setLibros] = useState([]);
  const [bibliotecas, setBibliotecas] = useState([]);
  const [misBibliotecas, setMisBibliotecas] = useState([]);
  const [bibliotecasSeguidas, setBibliotecasSeguidas] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [bibliotecaSeleccionada, setBibliotecaSeleccionada] = useState(null);
  const [mostrarModalInfoLibro, setMostrarModalInfoLibro] = useState(false);
  const [mostrarModalInfoBiblioteca, setMostrarModalInfoBiblioteca] = useState(false);
  const [mostrarModalAgregarLibro, setMostrarModalAgregarLibro] = useState(false);
  const [libroAbierto, setLibroAbierto] = useState(null);
  const [bibliotecaDestino, setBibliotecaDestino] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    cargarLibros();
    cargarBibliotecas();
    cargarMisBibliotecas();
    cargarBibliotecasSeguidas();
  }, []);

  const cargarLibros = async () => {
    try {
      const response = await fetch(`${API_URL}/api/libros/listar`);
      const data = await response.json();
      const librosVisibles = data.filter(libro => {
        if (libro.esPublico) return true;
        if (libro.biblioteca) return libro.biblioteca.creador.id === usuario.id;
        return false;
      });
      setLibros(librosVisibles);
    } catch (error) {
      console.error('Error al cargar libros:', error);
    }
  };

  const cargarBibliotecas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('🔍 TODAS las bibliotecas recibidas del backend:', data);
      
      if (Array.isArray(data)) {
        // Mostrar TODAS las bibliotecas públicas (excepto las propias)
        const bibliotecasPublicas = data.filter(b => {
          const esPublica = b.esPublica;
          const noEsMia = b.creador && b.creador.id !== usuario.id;
          console.log(`Biblioteca "${b.nombre}": Pública=${esPublica}, NoEsMia=${noEsMia}, Seguidores:`, b.seguidores);
          return esPublica && noEsMia;
        });
        
        console.log('📚 Bibliotecas filtradas para mostrar:', bibliotecasPublicas.map(b => b.nombre));
        setBibliotecas(bibliotecasPublicas);
      }
    } catch (error) {
      console.error('Error al cargar bibliotecas:', error);
      setBibliotecas([]);
    }
  };

  const cargarMisBibliotecas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const mias = data.filter(b => b.creador && b.creador.id === usuario.id);
        setMisBibliotecas(mias);
      }
    } catch (error) {
      console.error('Error al cargar mis bibliotecas:', error);
      setMisBibliotecas([]);
    }
  };

  const cargarBibliotecasSeguidas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('📚 Cargando bibliotecas seguidas...');
      if (Array.isArray(data)) {
        // Filtrar bibliotecas donde el usuario está en la lista de seguidores
        const seguidas = data.filter(b => 
          b.seguidores && b.seguidores.some(seg => seg.id === usuario.id)
        );
        console.log('✅ Bibliotecas que sigo:', seguidas.map(b => b.nombre));
        setBibliotecasSeguidas(seguidas.map(b => b.id));
      }
    } catch (error) {
      console.error('Error al cargar bibliotecas seguidas:', error);
    }
  };

  const librosFiltrados = libros.filter(libro =>
    libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    libro.autor.toLowerCase().includes(busqueda.toLowerCase())
  );

  const bibliotecasFiltradas = bibliotecas.filter(bib =>
    bib.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (bib.descripcion && bib.descripcion.toLowerCase().includes(busqueda.toLowerCase())) ||
    (bib.creador && bib.creador.username.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const abrirModalInfoLibro = (libro) => {
    setLibroSeleccionado(libro);
    setMostrarModalInfoLibro(true);
  };

  const abrirModalInfoBiblioteca = (biblioteca) => {
    setBibliotecaSeleccionada(biblioteca);
    setMostrarModalInfoBiblioteca(true);
  };

  const abrirModalAgregarLibro = (libro) => {
    setLibroSeleccionado(libro);
    setMostrarModalAgregarLibro(true);
    setBibliotecaDestino('');
    setMensaje('');
  };

  const abrirLibro = (libro) => {
    setLibroAbierto(libro);
  };

  const cerrarLibro = () => {
    setLibroAbierto(null);
  };

  const cerrarModales = () => {
    setMostrarModalInfoLibro(false);
    setMostrarModalInfoBiblioteca(false);
    setMostrarModalAgregarLibro(false);
    setLibroSeleccionado(null);
    setBibliotecaSeleccionada(null);
    setMensaje('');
    cargarLibros();
  };

  const agregarLibroABiblioteca = async () => {
    if (!bibliotecaDestino) {
      setMensaje('❌ Debes seleccionar una biblioteca');
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(
        `${API_URL}/api/bibliotecas/${bibliotecaDestino}/agregar-libro/${libroSeleccionado.id}`,
        { method: 'POST' }
      );

      if (response.ok) {
        setMensaje('✅ ¡Libro agregado exitosamente!');
        setTimeout(() => {
          cerrarModales();
          cargarMisBibliotecas();
        }, 1500);
      } else {
        const error = await response.text();
        setMensaje(`❌ ${error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error al agregar el libro');
    } finally {
      setCargando(false);
    }
  };

  const seguirBiblioteca = async (bibliotecaId, e) => {
    if (e) e.stopPropagation();
    
    const estaSiguiendo = bibliotecasSeguidas.includes(bibliotecaId);
    console.log(`${estaSiguiendo ? 'Dejando de seguir' : 'Siguiendo'} biblioteca ${bibliotecaId}`);

    try {
      let response;
      if (estaSiguiendo) {
        // Dejar de seguir
        response = await fetch(
          `${API_URL}/api/usuarios/${usuario.id}/dejar-de-seguir-biblioteca/${bibliotecaId}`,
          { method: 'DELETE' }
        );
      } else {
        // Seguir
        response = await fetch(
          `${API_URL}/api/usuarios/${usuario.id}/seguir-biblioteca/${bibliotecaId}`,
          { method: 'POST' }
        );
      }

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      if (response.ok) {
        // Actualizar el estado local INMEDIATAMENTE
        if (estaSiguiendo) {
          setBibliotecasSeguidas(prev => {
            const nuevas = prev.filter(id => id !== bibliotecaId);
            console.log('Estado actualizado - Ya no sigues:', nuevas);
            return nuevas;
          });
          mostrarNotificacion('💔 Has dejado de seguir esta biblioteca');
        } else {
          setBibliotecasSeguidas(prev => {
            const nuevas = [...prev, bibliotecaId];
            console.log('Estado actualizado - Ahora sigues:', nuevas);
            return nuevas;
          });
          mostrarNotificacion('⭐ ¡Ahora sigues esta biblioteca!');
        }
        
        // Recargar después para sincronizar con el backend
        setTimeout(() => {
          cargarBibliotecas();
          cargarBibliotecasSeguidas();
        }, 500);
      } else {
        mostrarNotificacion(`❌ ${responseText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('❌ Error de conexión');
    }
  };

  const mostrarNotificacion = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  const estaSiguiendoBiblioteca = (bibliotecaId) => {
    return bibliotecasSeguidas.includes(bibliotecaId);
  };

  const esCreadorDeBiblioteca = (biblioteca) => {
    return biblioteca.creador && biblioteca.creador.id === usuario.id;
  };

  const estaEnMiBiblioteca = (libro) => {
    if (!libro.esPublico && libro.biblioteca) {
      return libro.biblioteca.creador.id === usuario.id;
    }
    return false;
  };

  const obtenerColorLibro = (id) => {
    const colores = 8;
    return `color-${(id % colores) + 1}`;
  };

  const totalResultados = () => {
    if (filtroTipo === 'libros') return librosFiltrados.length;
    if (filtroTipo === 'bibliotecas') return bibliotecasFiltradas.length;
    return librosFiltrados.length + bibliotecasFiltradas.length;
  };

  return (
    <div className="explorador-wrapper day">
      <header className="explorador-header">
        <h1 className="titulo">📚 EXPLORADOR DE <span className="highlight">LIBROS Y BIBLIOTECAS</span></h1>
        <p className="subtitulo">Descubre y agrega contenido a tus bibliotecas</p>
      </header>

      {/* Notificación flotante */}
      {mensaje && !mostrarModalAgregarLibro && (
        <div className={`notificacion-flotante ${mensaje.includes('❌') ? 'error' : 'exito'}`}>
          {mensaje}
        </div>
      )}

      <div className="busqueda-container">
        <div className="input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por título, autor, nombre de biblioteca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>

        <div className="filtros-container">
          <button 
            className={`btn-filtro ${filtroTipo === 'todos' ? 'activo' : ''}`}
            onClick={() => setFiltroTipo('todos')}
          >
            📦 Todos
          </button>
          <button 
            className={`btn-filtro ${filtroTipo === 'libros' ? 'activo' : ''}`}
            onClick={() => setFiltroTipo('libros')}
          >
            📖 Solo Libros
          </button>
          <button 
            className={`btn-filtro ${filtroTipo === 'bibliotecas' ? 'activo' : ''}`}
            onClick={() => setFiltroTipo('bibliotecas')}
          >
            📚 Solo Bibliotecas
          </button>
        </div>

        <div className="resultados-info">
          {totalResultados()} resultado{totalResultados() !== 1 ? 's' : ''} encontrado{totalResultados() !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid">
        {/* LIBROS */}
        {(filtroTipo === 'todos' || filtroTipo === 'libros') && librosFiltrados.map(libro => (
          <div key={`libro-${libro.id}`} className="card">
            <div className="portada-container" onClick={() => abrirLibro(libro)} style={{ cursor: 'pointer' }}>
              {libro.rutaPortada ? (
                <img src={`${API_URL}${libro.rutaPortada}`} alt={libro.titulo} className="portada" />
              ) : (
                <div className="portada-placeholder">
                  <div className="icono-libro">📖</div>
                  <p className="sin-portada">Sin portada</p>
                </div>
              )}

              <button 
                className="btn-info" 
                onClick={(e) => {
                  e.stopPropagation();
                  abrirModalInfoLibro(libro);
                }} 
                title="Ver información"
              >
                ℹ️
              </button>
              {libro.esPublico && <span className="badge-publico">🌍 Público</span>}
              {!libro.esPublico && libro.biblioteca && <span className="badge-privado">🔒 {libro.biblioteca.nombre}</span>}
            </div>

            <div className="card-body">
              <h3 className="titulo-libro">{libro.titulo}</h3>
              <p className="autor-libro">👤 {libro.autor}</p>
              
              {libro.esPublico && (
                <button className="btn-agregar" onClick={() => abrirModalAgregarLibro(libro)}>
                  ➕ Agregar a biblioteca
                </button>
              )}
              {estaEnMiBiblioteca(libro) && (
                <div className="libro-en-biblioteca">✓ En tu biblioteca</div>
              )}
            </div>
          </div>
        ))}

        {/* BIBLIOTECAS */}
        {(filtroTipo === 'todos' || filtroTipo === 'bibliotecas') && bibliotecasFiltradas.map(biblioteca => (
          <div 
            key={`biblioteca-${biblioteca.id}`} 
            className="card card-biblioteca"
            onClick={() => abrirModalInfoBiblioteca(biblioteca)}
          >
            <div className="biblioteca-preview">
              <div className="biblioteca-icono-grande">📚</div>
              <div className="mini-estanteria-explorador">
                {biblioteca.libros && biblioteca.libros.length > 0 ? (
                  biblioteca.libros.slice(0, 4).map((libro) => (
                    <div key={libro.id} className="libro-mini-wrapper">
                      <img 
                        src={`${API_URL}/api/libros/portada/${libro.id}`}
                        alt={libro.titulo}
                        className="mini-portada"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.classList.add('visible');
                        }}
                      />
                      <div className={`libro-placeholder ${obtenerColorLibro(libro.id)}`}>
                        📖
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="sin-libros-mini">Sin libros</span>
                )}
              </div>
            </div>

            <div className="card-body">
              <div className="biblioteca-header-card">
                <span className="icono-biblioteca">🌍</span>
                <h3 className="titulo-biblioteca">{biblioteca.nombre}</h3>
              </div>
              
              <p className="creador-biblioteca">👤 {biblioteca.creador?.username}</p>
              <p className="descripcion-biblioteca">
                {biblioteca.descripcion || 'Sin descripción'}
              </p>
              
              <div className="biblioteca-stats">
                <span className="stat">📖 {biblioteca.libros?.length || 0} libros</span>
              </div>

              {!esCreadorDeBiblioteca(biblioteca) && (
                <button 
                  className={`btn-seguir ${estaSiguiendoBiblioteca(biblioteca.id) ? 'siguiendo' : ''}`}
                  onClick={(e) => seguirBiblioteca(biblioteca.id, e)}
                >
                  {estaSiguiendoBiblioteca(biblioteca.id) ? '✓ Siguiendo' : '⭐ Seguir biblioteca'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalResultados() === 0 && (
        <div className="no-resultados">
          <div className="icono-grande">
            {filtroTipo === 'libros' ? '📖' : filtroTipo === 'bibliotecas' ? '📚' : '📦'}
          </div>
          <p className="no-resultados-texto">
            {busqueda 
              ? `No se encontraron ${filtroTipo === 'todos' ? 'resultados' : filtroTipo} con esa búsqueda` 
              : `No hay ${filtroTipo === 'todos' ? 'contenido' : filtroTipo} disponible`}
          </p>
        </div>
      )}

      {/* MODAL INFO LIBRO */}
      {mostrarModalInfoLibro && libroSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar" onClick={cerrarModales}>✕</button>
            <div className="modal-header">
              <h2 className="modal-titulo">{libroSeleccionado.titulo}</h2>
              {libroSeleccionado.esPublico ? (
                <span className="badge-modal-publico">🌍 Libro Público</span>
              ) : (
                <span className="badge-modal-privado">🔒 Libro Privado</span>
              )}
            </div>
            <div className="modal-body">
              <div className="info-item"><strong>👤 Autor:</strong> {libroSeleccionado.autor}</div>
              <div className="info-item"><strong>📝 Descripción:</strong> {libroSeleccionado.descripcion || 'Sin descripción'}</div>
              {!libroSeleccionado.esPublico && libroSeleccionado.biblioteca && (
                <div className="info-item"><strong>📚 Biblioteca:</strong> {libroSeleccionado.biblioteca.nombre}</div>
              )}
              <button 
                className="btn-leer"
                onClick={() => {
                  cerrarModales();
                  abrirLibro(libroSeleccionado);
                }}
              >
                📖 Leer libro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFO BIBLIOTECA */}
      {mostrarModalInfoBiblioteca && bibliotecaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal modal-biblioteca" onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar" onClick={cerrarModales}>✕</button>
            <div className="modal-header">
              <h2 className="modal-titulo">
                <span>📚</span> {bibliotecaSeleccionada.nombre}
              </h2>
              <span className="badge-modal-publico">🌍 Biblioteca Pública</span>
            </div>
            <div className="modal-body">
              <div className="info-item"><strong>👤 Creador:</strong> {bibliotecaSeleccionada.creador?.username}</div>
              <div className="info-item"><strong>📝 Descripción:</strong> {bibliotecaSeleccionada.descripcion || 'Sin descripción'}</div>
              <div className="info-item"><strong>📖 Total de libros:</strong> {bibliotecaSeleccionada.libros?.length || 0}</div>
              
              {bibliotecaSeleccionada.libros && bibliotecaSeleccionada.libros.length > 0 && (
                <div className="libros-preview">
                  <h4>📚 Libros en esta biblioteca:</h4>
                  <div className="lista-libros-modal">
                    {bibliotecaSeleccionada.libros.map(libro => (
                      <div 
                        key={libro.id} 
                        className="libro-item-modal"
                        onClick={() => {
                          cerrarModales();
                          abrirLibro(libro);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="libro-icono">📖</span>
                        <span className="libro-titulo-modal">{libro.titulo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!esCreadorDeBiblioteca(bibliotecaSeleccionada) && (
                <button 
                  className={`btn-seguir-modal ${estaSiguiendoBiblioteca(bibliotecaSeleccionada.id) ? 'siguiendo' : ''}`}
                  onClick={(e) => seguirBiblioteca(bibliotecaSeleccionada.id, e)}
                >
                  {estaSiguiendoBiblioteca(bibliotecaSeleccionada.id) ? '✓ Siguiendo' : '⭐ Seguir esta biblioteca'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR LIBRO A BIBLIOTECA */}
      {mostrarModalAgregarLibro && libroSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModales}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="btn-cerrar" onClick={cerrarModales}>✕</button>
            <div className="modal-header">
              <h2 className="modal-titulo">Agregar "{libroSeleccionado.titulo}"</h2>
            </div>
            <div className="modal-body">
              {mensaje && (
                <div className={mensaje.includes('✅') ? 'mensaje-exito' : 'mensaje-error'}>
                  {mensaje}
                </div>
              )}

              <div className="form-group">
                <label>Selecciona una biblioteca:</label>
                <select 
                  value={bibliotecaDestino} 
                  onChange={(e) => setBibliotecaDestino(e.target.value)}
                  className="select-biblioteca"
                >
                  <option value="">-- Seleccionar --</option>
                  {misBibliotecas.map(bib => (
                    <option key={bib.id} value={bib.id}>
                      {bib.esPublica ? '🌍' : '🔒'} {bib.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-botones">
                <button className="btn-modal btn-cancelar" onClick={cerrarModales}>
                  Cancelar
                </button>
                <button 
                  className="btn-modal btn-confirmar" 
                  onClick={agregarLibroABiblioteca}
                  disabled={cargando}
                >
                  {cargando ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LECTOR DE PDF */}
      {libroAbierto && (
        <LectorLibro 
          url={`${API_URL}/api/libros/pdf/${libroAbierto.id}`}
          onClose={cerrarLibro}
        />
      )}
    </div>
  );
}

export default ExploradorLibros;