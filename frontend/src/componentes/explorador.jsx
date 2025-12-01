import React, { useState, useEffect } from 'react';

function ExploradorLibros({ usuario }) {
  console.log("Usuario recibido en Explorador:", usuario);
  const [libros, setLibros] = useState([]);
  const [bibliotecas, setBibliotecas] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [mostrarModalInfo, setMostrarModalInfo] = useState(false);
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [bibliotecaSeleccionada, setBibliotecaSeleccionada] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarLibros();
    cargarBibliotecas();
  }, []);

  const cargarLibros = async () => {
    try {
      // CAMBIO PRINCIPAL: Usar el endpoint correcto que carga TODOS los libros
      const response = await fetch(`http://localhost:8081/api/libros/listar`);
      const data = await response.json();
      console.log("📦 Datos recibidos de /listar:", data);

      // Filtrar libros visibles para el usuario:
      // - Libros públicos
      // - Libros privados en bibliotecas del usuario
      const librosVisibles = data.filter(libro => {
        // Si es público, siempre visible
        if (libro.esPublico) return true;
        
        // Si es privado, verificar si está en una biblioteca del usuario
        if (libro.biblioteca) {
          return libro.biblioteca.creador.id === usuario.id;
        }
        
        return false;
      });

      setLibros(librosVisibles);
    } catch (error) {
      console.error('Error al cargar libros:', error);
    }
  };

  const cargarBibliotecas = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/bibliotecas/listar');
      const data = await response.json();
      const misBibliotecas = data.filter(b => b.creador.id === usuario.id);
      setBibliotecas(misBibliotecas);
    } catch (error) {
      console.error('Error al cargar bibliotecas:', error);
    }
  };

  const abrirModalInfo = (libro) => {
    setLibroSeleccionado(libro);
    setMostrarModalInfo(true);
  };

  const abrirModalAgregar = (libro) => {
    setLibroSeleccionado(libro);
    setMostrarModalAgregar(true);
    setBibliotecaSeleccionada('');
    setMensaje('');
  };

  const cerrarModales = () => {
    setMostrarModalInfo(false);
    setMostrarModalAgregar(false);
    setLibroSeleccionado(null);
    setBibliotecaSeleccionada('');
    setMensaje('');
  };

  const agregarABiblioteca = async () => {
    if (!bibliotecaSeleccionada) {
      setMensaje('⚠️ Selecciona una biblioteca');
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(
        `http://localhost:8081/api/bibliotecas/${bibliotecaSeleccionada}/agregar-libro/${libroSeleccionado.id}`,
        { method: 'POST' }
      );

      if (response.ok) {
        setMensaje('✅ Libro agregado a tu biblioteca');
        setTimeout(() => {
          cerrarModales();
          cargarLibros();
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

  const librosFiltrados = libros.filter(libro =>
    libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    libro.autor.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Determinar si el libro ya está en alguna biblioteca del usuario
  const estaEnMiBiblioteca = (libro) => {
    if (!libro.esPublico && libro.biblioteca) {
      return libro.biblioteca.creador.id === usuario.id;
    }
    return false;
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titulo}>
          📚 EXPLORADOR DE <span style={styles.highlight}>LIBROS</span>
        </h1>
        <p style={styles.subtitulo}>Descubre y agrega libros a tus bibliotecas</p>
      </header>

      <div style={styles.busquedaContainer}>
        <div style={styles.inputWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.inputBusqueda}
          />
        </div>
        <div style={styles.resultadosInfo}>
          {librosFiltrados.length} libro{librosFiltrados.length !== 1 ? 's' : ''} encontrado{librosFiltrados.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={styles.grid}>
        {librosFiltrados.map(libro => (
          <div 
            key={libro.id} 
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
          >
            <div style={styles.portadaContainer}>
              {libro.rutaPortada ? (
                <img
                  src={`http://localhost:8081${libro.rutaPortada}`}
                  alt={libro.titulo}
                  style={styles.portada}
                />
              ) : (
                <div style={styles.portadaPlaceholder}>
                  <div style={styles.iconoLibro}>📖</div>
                  <p style={styles.sinPortada}>Sin portada</p>
                </div>
              )}
              <button
                style={styles.btnInfo}
                onClick={() => abrirModalInfo(libro)}
                title="Ver información"
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
              >
                ℹ️
              </button>
              {libro.esPublico && (
                <span style={styles.badgePublico}>🌍 Público</span>
              )}
              {!libro.esPublico && libro.biblioteca && (
                <span style={styles.badgePrivado}>
                  🔒 {libro.biblioteca.nombre}
                </span>
              )}
            </div>
            
            <div style={styles.cardBody}>
              <h3 style={styles.tituloLibro} title={libro.titulo}>
                {libro.titulo}
              </h3>
              <p style={styles.autorLibro}>
                👤 {libro.autor}
              </p>
              
              {libro.esPublico && (
                <button
                  style={styles.btnAgregar}
                  onClick={() => abrirModalAgregar(libro)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ➕ Agregar a biblioteca
                </button>
              )}
              {estaEnMiBiblioteca(libro) && (
                <div style={styles.libroEnBiblioteca}>
                  📚 En tu biblioteca
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {librosFiltrados.length === 0 && (
        <div style={styles.noResultados}>
          <div style={styles.iconoGrande}>📚</div>
          <p style={styles.noResultadosTexto}>
            {busqueda ? 'No se encontraron libros con esa búsqueda' : 'No hay libros disponibles'}
          </p>
        </div>
      )}

      {/* Modal de Información */}
      {mostrarModalInfo && libroSeleccionado && (
        <div style={styles.modalOverlay} onClick={cerrarModales}>
          <div 
            style={styles.modal} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={styles.btnCerrar} 
              onClick={cerrarModales}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
            >
              ✕
            </button>
            
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitulo}>{libroSeleccionado.titulo}</h2>
              {libroSeleccionado.esPublico ? (
                <span style={styles.badgeModalPublico}>🌍 Libro Público</span>
              ) : (
                <span style={styles.badgeModalPrivado}>🔒 Libro Privado</span>
              )}
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <strong style={styles.infoLabel}>
                    👤 Autor:
                  </strong>
                  <p style={styles.infoTexto}>{libroSeleccionado.autor}</p>
                </div>
                
                <div style={styles.infoItem}>
                  <strong style={styles.infoLabel}>
                    📝 Descripción:
                  </strong>
                  <p style={styles.infoTexto}>
                    {libroSeleccionado.descripcion || 'Sin descripción disponible'}
                  </p>
                </div>
                
                <div style={styles.infoItem}>
                  <strong style={styles.infoLabel}>👥 Agregado por:</strong>
                  <p style={styles.infoTexto}>{libroSeleccionado.agregador.username}</p>
                </div>
                
                {!libroSeleccionado.esPublico && libroSeleccionado.biblioteca && (
                  <div style={styles.infoItem}>
                    <strong style={styles.infoLabel}>📚 Biblioteca:</strong>
                    <p style={styles.infoTexto}>{libroSeleccionado.biblioteca.nombre}</p>
                  </div>
                )}
              </div>
              
              {libroSeleccionado.rutaPdf && (
                <a
                  href={`http://localhost:8081${libroSeleccionado.rutaPdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.btnLeer}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  📄 Abrir PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agregar a Biblioteca */}
      {mostrarModalAgregar && libroSeleccionado && (
        <div style={styles.modalOverlay} onClick={cerrarModales}>
          <div 
            style={styles.modal} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={styles.btnCerrar} 
              onClick={cerrarModales}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
            >
              ✕
            </button>
            
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitulo}>Agregar a Biblioteca</h2>
              <p style={styles.modalSubtitulo}>{libroSeleccionado.titulo}</p>
            </div>
            
            <div style={styles.modalBody}>
              <label style={styles.label}>Selecciona una biblioteca:</label>
              <select
                value={bibliotecaSeleccionada}
                onChange={(e) => setBibliotecaSeleccionada(e.target.value)}
                style={styles.select}
              >
                <option value="">-- Selecciona una biblioteca --</option>
                {bibliotecas.map(bib => (
                  <option key={bib.id} value={bib.id}>
                    {bib.nombre} {bib.esPublica ? '🌍' : '🔒'}
                  </option>
                ))}
              </select>
              
              {bibliotecas.length === 0 && (
                <div style={styles.avisoContainer}>
                  <p style={styles.aviso}>
                    ⚠️ No tienes bibliotecas creadas.
                  </p>
                  <p style={styles.avisoTexto}>
                    Crea una biblioteca primero para poder agregar libros.
                  </p>
                </div>
              )}
              
              {mensaje && (
                <div style={{
                  ...styles.mensaje,
                  ...(mensaje.includes('✅') ? styles.mensajeExito : styles.mensajeError)
                }}>
                  {mensaje}
                </div>
              )}
              
              <button
                style={{
                  ...styles.btnConfirmar,
                  ...(cargando || bibliotecas.length === 0 ? styles.btnConfirmarDisabled : {})
                }}
                onClick={agregarABiblioteca}
                disabled={cargando || bibliotecas.length === 0}
                onMouseEnter={(e) => {
                  if (!cargando && bibliotecas.length > 0) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {cargando ? 'Agregando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    color: 'white',
  },
  titulo: {
    fontSize: '3rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '10px',
  },
  highlight: {
    color: '#ffd700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  subtitulo: {
    fontSize: '1.2rem',
    opacity: 0.9,
  },
  busquedaContainer: {
    maxWidth: '700px',
    margin: '0 auto 40px',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: '10px',
  },
  searchIcon: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.2rem',
  },
  inputBusqueda: {
    width: '100%',
    padding: '15px 20px 15px 55px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '50px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    outline: 'none',
  },
  resultadosInfo: {
    textAlign: 'center',
    color: 'white',
    fontSize: '0.95rem',
    opacity: 0.9,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  },
  portadaContainer: {
    position: 'relative',
    height: '350px',
    overflow: 'hidden',
    background: '#f5f5f5',
  },
  portada: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  portadaPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
    gap: '10px',
  },
  iconoLibro: {
    fontSize: '4rem',
  },
  sinPortada: {
    margin: 0,
    color: '#999',
    fontSize: '0.9rem',
  },
  btnInfo: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    fontSize: '1.2rem',
  },
  badgePublico: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'rgba(76, 175, 80, 0.95)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  badgePrivado: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'rgba(255, 152, 0, 0.95)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  cardBody: {
    padding: '20px',
  },
  tituloLibro: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '10px',
    minHeight: '50px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.4',
  },
  autorLibro: {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  btnAgregar: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.2s ease',
  },
  libroEnBiblioteca: {
    width: '100%',
    padding: '12px',
    background: '#f5f5f5',
    color: '#666',
    border: '2px dashed #ddd',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  noResultados: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'white',
  },
  iconoGrande: {
    fontSize: '5rem',
    marginBottom: '20px',
  },
  noResultadosTexto: {
    fontSize: '1.2rem',
    marginTop: '20px',
    opacity: 0.9,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '550px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  btnCerrar: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'rgba(0,0,0,0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    zIndex: 10,
    fontSize: '1.5rem',
    color: '#333',
  },
  modalHeader: {
    padding: '35px 30px 25px',
    borderBottom: '2px solid #f0f0f0',
  },
  modalTitulo: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '10px',
    paddingRight: '40px',
  },
  modalSubtitulo: {
    fontSize: '1.05rem',
    color: '#666',
    margin: 0,
  },
  badgeModalPublico: {
    display: 'inline-block',
    background: 'rgba(76, 175, 80, 0.15)',
    color: '#4caf50',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  badgeModalPrivado: {
    display: 'inline-block',
    background: 'rgba(255, 152, 0, 0.15)',
    color: '#ff9800',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  modalBody: {
    padding: '30px',
  },
  infoGrid: {
    marginBottom: '25px',
  },
  infoItem: {
    marginBottom: '20px',
  },
  infoLabel: {
    display: 'block',
    fontSize: '1rem',
    color: '#333',
    marginBottom: '8px',
    fontWeight: '600',
  },
  infoTexto: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.6',
    margin: 0,
  },
  label: {
    display: 'block',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  select: {
    width: '100%',
    padding: '14px',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    marginBottom: '20px',
    transition: 'border-color 0.3s ease',
    cursor: 'pointer',
  },
  avisoContainer: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  aviso: {
    color: '#856404',
    fontSize: '0.95rem',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  avisoTexto: {
    color: '#856404',
    fontSize: '0.9rem',
    margin: 0,
  },
  mensaje: {
    padding: '14px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  mensajeExito: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  mensajeError: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  btnConfirmar: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  btnConfirmarDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  btnLeer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    background: '#4caf50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '1rem',
    marginTop: '15px',
    transition: 'transform 0.2s ease',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
  },
};

export default ExploradorLibros;