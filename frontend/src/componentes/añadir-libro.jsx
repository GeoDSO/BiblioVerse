import React, { useState } from 'react';
import './añadir-libro.css';

function AnadirLibro({ usuario }) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    descripcion: ''
  });

  const [archivoPDF, setArchivoPDF] = useState(null);
  const [portada, setPortada] = useState(null);
  const [previewPortada, setPreviewPortada] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMensaje('');
  };

  // Cambios en archivo PDF
  const handlePDFChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) {
      setArchivoPDF(null);
      return;
    }
    if (archivo.type !== 'application/pdf') {
      setMensaje('⚠️ Solo se permiten archivos PDF');
      setArchivoPDF(null);
      return;
    }
    if (archivo.size > 50 * 1024 * 1024) {
      setMensaje('⚠️ El archivo es muy grande (máximo 50MB)');
      setArchivoPDF(null);
      return;
    }
    setArchivoPDF(archivo);
    setMensaje('✅ PDF cargado correctamente');
  };

  // Cambios en portada
  const handlePortadaChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) {
      setPortada(null);
      setPreviewPortada(null);
      return;
    }
    if (!archivo.type.startsWith('image/')) {
      setMensaje('⚠️ Solo se permiten imágenes');
      setPortada(null);
      setPreviewPortada(null);
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje('⚠️ La imagen es muy grande (máximo 5MB)');
      setPortada(null);
      setPreviewPortada(null);
      return;
    }
    setPortada(archivo);
    const reader = new FileReader();
    reader.onload = (event) => setPreviewPortada(event.target.result);
    reader.readAsDataURL(archivo);
    setMensaje('✅ Portada cargada correctamente');
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    if (!formData.titulo.trim()) {
      setMensaje('⚠️ Debes ingresar un título');
      setCargando(false);
      return;
    }
    if (!formData.autor.trim()) {
      setMensaje('⚠️ Debes ingresar el autor');
      setCargando(false);
      return;
    }

    // Validación de usuario
    if (!usuario || !usuario.id) {
      setMensaje('❌ Usuario no logueado');
      setCargando(false);
      return;
    }

    try {
      const datos = new FormData();
      datos.append('titulo', formData.titulo);
      datos.append('autor', formData.autor);
      datos.append('descripcion', formData.descripcion);
      datos.append('idUsuario', usuario.id);

      if (archivoPDF) datos.append('archivoPdf', archivoPDF);
      if (portada) datos.append('portada', portada);

      console.log('Enviando libro con ID usuario:', usuario.id);

      const response = await fetch('http://localhost:8081/api/libros/subir', {
        method: 'POST',
        body: datos
      });

      if (response.ok) {
        setMensaje('✅ ¡Libro agregado exitosamente!');
        setFormData({ titulo: '', autor: '', descripcion: '' });
        setArchivoPDF(null);
        setPortada(null);
        setPreviewPortada(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMensaje(`❌ Error al agregar el libro: ${errorData.message || ''}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="anadir-libros-container">
      <form className="formulario-libro" onSubmit={handleSubmit}>

        <div className="seccion-formulario">
          <h2>Información del Libro</h2>

          <div className="grupo-input">
            <label htmlFor="titulo">Título del Libro *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ej: El Quijote"
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="autor">Autor *</label>
            <input
              type="text"
              id="autor"
              name="autor"
              value={formData.autor}
              onChange={handleInputChange}
              placeholder="Ej: Miguel de Cervantes"
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Cuéntanos sobre este libro..."
              rows="4"
            />
          </div>
        </div>

        <div className="seccion-formulario">
          <h2>Archivos</h2>

          <div className="grupo-input">
            <label htmlFor="archivoPDF">Archivo PDF</label>
            <input
              type="file"
              id="archivoPDF"
              accept=".pdf"
              onChange={handlePDFChange}
              className="input-file"
            />
            {archivoPDF && <p className="nombre-archivo">📄 {archivoPDF.name}</p>}
          </div>

          <div className="grupo-input">
            <label htmlFor="portada">Portada</label>
            <input
              type="file"
              id="portada"
              accept="image/*"
              onChange={handlePortadaChange}
              className="input-file"
            />
            {previewPortada && (
              <div className="preview-portada">
                <img src={previewPortada} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        {mensaje && (
          <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>
            {mensaje}
          </div>
        )}

        <button type="submit" className="boton-enviar" disabled={cargando}>
          {cargando ? 'Agregando...' : 'Agregar Libro'}
        </button>
      </form>
    </div>
  );
}

export default AnadirLibro;
