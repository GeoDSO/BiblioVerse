import { useState, useEffect } from 'react';
import './explorador.css';

function Explorador() {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);

  useEffect(() => {
    cargarLibros();
  }, []);

  const cargarLibros = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/libros/listar');
      const data = await response.json();
      setLibros(data);
    } catch (error) {
      console.error('Error al cargar libros:', error);
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalle = (libro) => {
    setLibroSeleccionado(libro);
  };

  const cerrarDetalle = () => {
    setLibroSeleccionado(null);
  };

  if (cargando) {
    return <div className="cargando">Cargando libros...</div>;
  }

  return (
    <div className="explorador-container">
      <header className="explorador-header">
        <h1>Explorar Libros</h1>
        <p>Descubre los libros compartidos por la comunidad</p>
      </header>

      <div className="libros-grid">
        {libros.map((libro) => (
          <div 
            key={libro.id} 
            className="libro-card"
            onClick={() => abrirDetalle(libro)}
          >
            <div className="libro-portada">
              <div className="portada-placeholder">📚</div>
            </div>
            <div className="libro-info">
              <h3>{libro.titulo}</h3>
              <p className="libro-autor">{libro.autor}</p>
            </div>
          </div>
        ))}
      </div>

      {libros.length === 0 && (
        <div className="sin-libros">
          <p>📚 Aún no hay libros en el explorador</p>
          <p>¡Sé el primero en agregar uno!</p>
        </div>
      )}

      {libroSeleccionado && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={cerrarDetalle}>✕</button>
            
            <div className="modal-body">
              <div className="modal-portada">
                <div className="portada-placeholder-grande">📚</div>
              </div>
              
              <div className="modal-info">
                <h2>{libroSeleccionado.titulo}</h2>
                <p className="modal-autor">Por {libroSeleccionado.autor}</p>
                
                <button className="btn-leer">📖 Leer Libro</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explorador;