import React, { useState, useEffect } from 'react';
import './explorador.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

function ExploradorLibros({ usuario }) {
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      // Bibliotecas propias
      const misBibliotecas = data.filter(b => b.creador && b.creador.id === usuario.id);

      // Bibliotecas públicas de otros usuarios
      const publicas = data.filter(b => b.esPublica && b.creador && b.creador.id !== usuario.id);

      // Unimos ambas listas
      const todasBibliotecas = [...misBibliotecas, ...publicas];

      setBibliotecas(todasBibliotecas);
    } else {
      console.error('❌ El backend no devolvió un array:', data);
      setBibliotecas([]);
    }
    
  } catch (error) {
    console.error('❌ Error al cargar bibliotecas:', error);
    setBibliotecas([]);
  }
};


  const librosFiltrados = libros.filter(libro =>
    libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    libro.autor.toLowerCase().includes(busqueda.toLowerCase())
  );

  const estaEnMiBiblioteca = (libro) => {
    if (!libro.esPublico && libro.biblioteca) {
      return libro.biblioteca.creador.id === usuario.id;
    }
    return false;
  };

  return (
    <div className="explorador-wrapper day">
      <header className="explorador-header">
        <h1 className="titulo">📚 EXPLORADOR DE <span className="highlight">LIBROS</span></h1>
        <p className="subtitulo">Descubre y agrega libros a tus bibliotecas</p>
      </header>

      <div className="busqueda-container">
        <div className="input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>
        <div className="resultados-info">
          {librosFiltrados.length} libro{librosFiltrados.length !== 1 ? 's' : ''} encontrado{librosFiltrados.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid">
        {librosFiltrados.map(libro => (
          <div 
            key={libro.id} 
            className="card"
          >
            <div className="portada-container">
              {libro.rutaPortada ? (
                <img src={`${API_URL}${libro.rutaPortada}`} alt={libro.titulo} className="portada" />
              ) : (
                <div className="portada-placeholder">
                  <div className="icono-libro">📖</div>
                  <p className="sin-portada">Sin portada</p>
                </div>
              )}

              <button className="btn-info" onClick={() => abrirModalInfo(libro)} title="Ver información">ℹ️</button>
              {libro.esPublico && <span className="badge-publico">🌍 Público</span>}
              {!libro.esPublico && libro.biblioteca && <span className="badge-privado">🔒 {libro.biblioteca.nombre}</span>}
            </div>

            <div className="card-body">
              <h3 className="titulo-libro">{libro.titulo}</h3>
              <p className="autor-libro">👤 {libro.autor}</p>
              
              {libro.esPublico && (
                <button className="btn-agregar" onClick={() => abrirModalAgregar(libro)}>➕ Agregar a biblioteca</button>
              )}
              {estaEnMiBiblioteca(libro) && (
                <div className="libro-en-biblioteca">📚 En tu biblioteca</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {librosFiltrados.length === 0 && (
        <div className="no-resultados">
          <div className="icono-grande">📚</div>
          <p className="no-resultados-texto">
            {busqueda ? 'No se encontraron libros con esa búsqueda' : 'No hay libros disponibles'}
          </p>
        </div>
      )}

      {/* Modales */}
      {mostrarModalInfo && libroSeleccionado && (
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
              {libroSeleccionado.rutaPdf && (
                <a href={`${API_URL}${libroSeleccionado.rutaPdf}`} target="_blank" rel="noopener noreferrer" className="btn-leer">
                  📄 Abrir PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploradorLibros;
