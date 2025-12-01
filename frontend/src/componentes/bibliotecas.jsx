import React, { useState, useEffect } from 'react';
import './bibliotecas.css';
import LectorLibro from './lectorlibro'; // ← Importar el lector

function Bibliotecas({ usuario }) {
  const [Bibliotecas, setBibliotecas] = useState([]);
  const [bibliotecaExpandida, setBibliotecaExpandida] = useState(null);
  const [libroAbierto, setLibroAbierto] = useState(null); // ← NUEVO
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarBibliotecas();
  }, []);

  const obtenerColorLibro = (libroId) => {
    const colores = 8;
    return `color-${(libroId % colores) + 1}`;
  };

  const cargarBibliotecas = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/bibliotecas/listar');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const misBibliotecas = data.filter(b => b.creador && b.creador.id === usuario.id);
        setBibliotecas(misBibliotecas);
      } else {
        console.error('❌ El backend no devolvió un array:', data);
        setBibliotecas([]);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar bibliotecas:', error);
      setBibliotecas([]);
    }
  };

  const expandirBiblioteca = (biblioteca) => {
    setBibliotecaExpandida(biblioteca);
  };

  const cerrarExpandida = () => {
    setBibliotecaExpandida(null);
  };

  // ← NUEVO: Abrir libro para leer
  const abrirLibro = (libro, e) => {
    e.stopPropagation();
    setLibroAbierto(libro);
  };

  // ← NUEVO: Cerrar lector
  const cerrarLibro = () => {
    setLibroAbierto(null);
  };

  const eliminarBiblioteca = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta biblioteca? Los libros no se eliminarán.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/bibliotecas/eliminar/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Biblioteca eliminada');
        cargarBibliotecas();
        cerrarExpandida();
      } else {
        alert('❌ Error al eliminar la biblioteca');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    }
  };

  const eliminarLibroDeBiblioteca = async (idBiblioteca, idLibro, e) => {
    e.stopPropagation();
    
    if (!window.confirm('¿Quieres eliminar este libro de la biblioteca?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8081/api/bibliotecas/${idBiblioteca}/eliminar-libro/${idLibro}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        alert('✅ Libro eliminado de la biblioteca');
        
        const bibliotecaActualizada = {
          ...bibliotecaExpandida,
          libros: bibliotecaExpandida.libros.filter(libro => libro.id !== idLibro)
        };
        setBibliotecaExpandida(bibliotecaActualizada);
        
        cargarBibliotecas();
      } else {
        alert('❌ Error al eliminar el libro');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    }
  };

  const handleImageError = (e, libroId) => {
    e.target.style.display = 'none';
    const placeholder = e.target.nextSibling;
    if (placeholder) {
      placeholder.classList.add('visible');
    }
  };

  return (
    <>
      <div className="bibliotecas-container">
        {Bibliotecas.length === 0 && (
          <p style={{gridColumn: '1 / -1', textAlign: 'center', color: '#7b5747', fontSize: '1.1rem'}}>
            No tienes bibliotecas aún. ¡Crea tu primera biblioteca! 📚
          </p>
        )}
        
        {Bibliotecas.map((biblioteca) => (
          <div 
            key={biblioteca.id} 
            className="biblioteca-card"
            onClick={() => expandirBiblioteca(biblioteca)}
          >
            <div className="biblioteca-header">
              <span className="icono">{biblioteca.esPublica ? '🌍' : '🔒'}</span>
              <h3>{biblioteca.nombre}</h3>
            </div>

            <p className="biblioteca-descripcion">
              {biblioteca.descripcion || 'Sin descripción'}
            </p>

            <div className="mini-estanteria">
              {biblioteca.libros && biblioteca.libros.length > 0 ? (
                biblioteca.libros.slice(0, 6).map((libro) => (
                  <div key={libro.id} className="libro-mini-wrapper">
                    <img 
                      src={`http://localhost:8081/api/libros/portada/${libro.id}`}
                      alt={libro.titulo}
                      className="mini-portada"
                      onError={(e) => handleImageError(e, libro.id)}
                    />
                    <div className={`libro-placeholder ${obtenerColorLibro(libro.id)}`}>
                      📖
                    </div>
                  </div>
                ))
              ) : (
                <span className="sin-libros-mini">Sin libros aún</span>
              )}
            </div>

            <div className="biblioteca-footer">
              <span className={biblioteca.esPublica ? "badge-publica" : "badge-privada"}>
                {biblioteca.esPublica ? 'Pública' : 'Privada'}
              </span>

              <span className="cantidad">
                📖 {biblioteca.libros?.length || 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* VISTA EXPANDIDA */}
      {bibliotecaExpandida && (
        <div className="biblioteca-expandida" onClick={cerrarExpandida}>
          <div className="biblioteca-expandida-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="biblioteca-expandida-header">
              <h2>
                <span>{bibliotecaExpandida.esPublica ? '🌍' : '🔒'}</span>
                {bibliotecaExpandida.nombre}
              </h2>
              <button className="btn-cerrar" onClick={cerrarExpandida}>×</button>
            </div>

            <div className="biblioteca-expandida-body">
              <div className="biblioteca-expandida-info">
                <p><strong>Descripción:</strong> {bibliotecaExpandida.descripcion || 'Sin descripción'}</p>
                <p>
                  <strong>Visibilidad:</strong> 
                  <span className={bibliotecaExpandida.esPublica ? "badge-publica" : "badge-privada"} style={{marginLeft: '0.5rem'}}>
                    {bibliotecaExpandida.esPublica ? 'Pública' : 'Privada'}
                  </span>
                </p>
                <p><strong>Total de libros:</strong> {bibliotecaExpandida.libros?.length || 0}</p>
                
                <button 
                  className="btn-eliminar"
                  onClick={() => eliminarBiblioteca(bibliotecaExpandida.id)}
                >
                  🗑️ Eliminar Biblioteca
                </button>
              </div>

              {/* ESTANTERÍA GRANDE */}
              <div className="estanteria-grande">
                {bibliotecaExpandida.libros && bibliotecaExpandida.libros.length > 0 ? (
                  bibliotecaExpandida.libros.map((libro) => (
                    <div 
                      key={libro.id} 
                      className="libro-grande"
                      onClick={(e) => abrirLibro(libro, e)} // ← NUEVO: Click para abrir
                    >
                      <button 
                        className="btn-eliminar-libro"
                        onClick={(e) => eliminarLibroDeBiblioteca(bibliotecaExpandida.id, libro.id, e)}
                        title="Eliminar de la biblioteca"
                      >
                        ×
                      </button>
                      <div className="libro-grande-portada-wrapper">
                        <img 
                          src={`http://localhost:8081/api/libros/portada/${libro.id}`}
                          alt={libro.titulo}
                          onError={(e) => handleImageError(e, libro.id)}
                        />
                        <div className={`libro-placeholder-grande ${obtenerColorLibro(libro.id)}`}>
                          📚
                        </div>
                      </div>
                      <div className="libro-grande-titulo">{libro.titulo}</div>
                    </div>
                  ))
                ) : (
                  <div className="sin-libros-grande">
                    📚 Esta biblioteca aún no tiene libros
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ← NUEVO: LECTOR DE PDF */}
      {libroAbierto && (
        <LectorLibro 
          url={`http://localhost:8081/api/libros/pdf/${libroAbierto.id}`}
          onClose={cerrarLibro}
        />
      )}
    </>
  );
}

export default Bibliotecas;