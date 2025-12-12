import React, { useState, useEffect } from 'react';
import './bibliotecas.css';
import LectorLibro from './lectorlibro';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

function Bibliotecas({ usuario }) {
  const [Bibliotecas, setBibliotecas] = useState([]);
  const [bibliotecaExpandida, setBibliotecaExpandida] = useState(null);
  const [libroAbierto, setLibroAbierto] = useState(null);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    esPublica: false
  });
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
      const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("JSON completo:", JSON.stringify(data, null, 2)); 
      console.log("Descripción de la primera biblioteca:", data[0]?.descripcion);
      
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

  const abrirLibro = (libro, e) => {
    e.stopPropagation();
    setLibroAbierto(libro);
  };

  const cerrarLibro = () => {
    setLibroAbierto(null);
  };

  // CREAR BIBLIOTECA
  const abrirModalCrear = () => {
    setMostrarModalCrear(true);
    setFormData({ nombre: '', descripcion: '', esPublica: false });
    setMensaje('');
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
    setFormData({ nombre: '', descripcion: '', esPublica: false });
    setMensaje('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMensaje('');
  };

  const handleVisibilidadChange = (esPublica) => {
    setFormData(prev => ({ ...prev, esPublica }));
  };

  const crearBiblioteca = async () => {
    if (!formData.nombre.trim()) {
      setMensaje('❌ El nombre es obligatorio');
      return;
    }

    setCargando(true);
    try {
      const datosEnviar = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || "",
        esPublica: formData.esPublica,
        idUsuario: usuario.id
      };

      const response = await fetch(`${API_URL}/api/bibliotecas/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar)
      });

      if (response.ok) {
        setMensaje('✅ ¡Biblioteca creada exitosamente!');
        setTimeout(() => {
          cerrarModalCrear();
          cargarBibliotecas();
        }, 1500);
      } else {
        const error = await response.text();
        setMensaje(`❌ ${error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error al crear la biblioteca');
    } finally {
      setCargando(false);
    }
  };

  const eliminarBiblioteca = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta biblioteca? Los libros no se eliminarán.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/bibliotecas/eliminar/${id}`, {
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
        `${API_URL}/api/bibliotecas/${idBiblioteca}/eliminar-libro/${idLibro}`,
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
    <div className="page-wrapper day">
      <div className="page-content">
        <div className="bibliotecas-container">
          {/* TARJETA PARA CREAR BIBLIOTECA */}
          <div className="biblioteca-card biblioteca-card-crear" onClick={abrirModalCrear}>
            <div className="icono-crear">➕</div>
            <h3>Agregar Biblioteca</h3>
          </div>

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
                {biblioteca.descripcion|| 'Sin descripción'}
              </p>

              <div className="mini-estanteria">
                {biblioteca.libros && biblioteca.libros.length > 0 ? (
                  biblioteca.libros.slice(0, 6).map((libro) => (
                    <div key={libro.id} className="libro-mini-wrapper">
                      <img 
                        src={libro.rutaPortada} 
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

        {/* MODAL CREAR BIBLIOTECA */}
        {mostrarModalCrear && (
          <div className="modal-crear-biblioteca" onClick={cerrarModalCrear}>
            <div className="modal-crear-contenido" onClick={(e) => e.stopPropagation()}>
              <h2>📚 Crear Nueva Biblioteca</h2>

              {mensaje && (
                <div className={mensaje.includes('✅') ? 'mensaje-exito' : 'mensaje-error'}>
                  {mensaje}
                </div>
              )}

              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Mi Biblioteca de..."
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe tu biblioteca..."
                />
              </div>

              <div className="form-group">
                <label>Visibilidad</label>
                <div className="visibilidad-opciones">
                  <div 
                    className={`opcion-visibilidad ${!formData.esPublica ? 'activa' : ''}`}
                    onClick={() => handleVisibilidadChange(false)}
                  >
                    <div className="icono-opcion">🔒</div>
                    <h3>Privada</h3>
                    <p>Solo tú puedes verla</p>
                  </div>

                  <div 
                    className={`opcion-visibilidad ${formData.esPublica ? 'activa' : ''}`}
                    onClick={() => handleVisibilidadChange(true)}
                  >
                    <div className="icono-opcion">🌍</div>
                    <h3>Pública</h3>
                    <p>Visible en el explorador</p>
                  </div>
                </div>
              </div>

              <div className="modal-botones">
                <button className="btn-modal btn-cancelar" onClick={cerrarModalCrear}>
                  Cancelar
                </button>
                <button 
                  className="btn-modal btn-crear" 
                  onClick={crearBiblioteca}
                  disabled={cargando}
                >
                  {cargando ? 'Creando...' : 'Crear Biblioteca'}
                </button>
              </div>
            </div>
          </div>
        )}

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

                <div className="estanteria-grande">
                  {bibliotecaExpandida.libros && bibliotecaExpandida.libros.length > 0 ? (
                    bibliotecaExpandida.libros.map((libro) => (
                      <div 
                        key={libro.id} 
                        className="libro-grande"
                        onClick={(e) => abrirLibro(libro, e)}
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
                            src={`${API_URL}/api/libros/portada/${libro.id}`}
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

        {/* LECTOR DE PDF */}
        {libroAbierto && (
          <LectorLibro 
            url={`${API_URL}/api/libros/pdf/${libroAbierto.id}`}
            onClose={cerrarLibro}
          />
        )}
      </div>
    </div>
  );
}

export default Bibliotecas;