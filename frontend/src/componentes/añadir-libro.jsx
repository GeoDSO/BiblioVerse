import React, { useState, useEffect } from 'react';
import './añadir-libro.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

function AnadirLibro({ usuario }) {
    const [formData, setFormData] = useState({
        titulo: '',
        autor: '',
        descripcion: '',
        esPublico: true,
        idBiblioteca: ''
    });

    const [bibliotecas, setBibliotecas] = useState([]);
    const [archivoPDF, setArchivoPDF] = useState(null);
    const [portada, setPortada] = useState(null);
    const [previewPortada, setPreviewPortada] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        cargarBibliotecas();
    }, []);

    const cargarBibliotecas = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
            const data = await response.json();
            const misBibliotecas = data.filter(b => b.creador.id === usuario.id);
            setBibliotecas(misBibliotecas);
        } catch (error) {
            console.error('Error al cargar bibliotecas:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setMensaje('');
    };

    const handleVisibilidadChange = (esPublico) => {
        setFormData(prev => ({
            ...prev,
            esPublico,
            idBiblioteca: esPublico ? '' : prev.idBiblioteca
        }));
    };

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

        if (!formData.esPublico && !formData.idBiblioteca) {
            setMensaje('⚠️ Los libros privados deben estar en una biblioteca');
            setCargando(false);
            return;
        }

        try {
            const datos = new FormData();
            datos.append('titulo', formData.titulo.trim());
            datos.append('autor', formData.autor.trim());
            datos.append('descripcion', formData.descripcion.trim());
            datos.append('idUsuario', usuario.id.toString());
            datos.append('esPublico', formData.esPublico.toString());

            if (!formData.esPublico && formData.idBiblioteca) {
                datos.append('idBiblioteca', formData.idBiblioteca.toString());
            }

            if (archivoPDF) {
                datos.append('archivoPdf', archivoPDF);
            }

            if (portada) {
                datos.append('portada', portada);
            }

            console.log('Enviando datos:');
            for (let pair of datos.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await fetch(`${API_URL}/api/libros/subir`, {
                method: 'POST',
                body: datos,
            });

            if (response.ok) {
                const resultado = await response.json();
                console.log('Libro creado:', resultado);
                setMensaje('✅ ¡Libro agregado exitosamente!');
                
                setFormData({
                    titulo: '',
                    autor: '',
                    descripcion: '',
                    esPublico: true,
                    idBiblioteca: ''
                });
                setArchivoPDF(null);
                setPortada(null);
                setPreviewPortada(null);
                
                document.getElementById('archivoPDF').value = '';
                document.getElementById('portada').value = '';
            } else {
                const errorData = await response.json().catch(() => null);
                console.error('Error del servidor:', errorData);
                
                if (errorData && errorData.error) {
                    setMensaje(`❌ Error: ${errorData.error}`);
                } else {
                    setMensaje(`❌ Error del servidor (${response.status})`);
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            setMensaje('❌ Error de conexión con el servidor');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="page-wrapper day">
            <div className="page-content">
                <div className="anadir-libros-container">
                    <header className="header-anadir">
                        <h1>AGREGAR <span>NUEVO LIBRO</span></h1>
                        <p>Comparte tus libros con todos o guárdalos en tu biblioteca privada</p>
                    </header>

                    <form className="formulario-libro" onSubmit={handleSubmit}>
                        <div className="seccion-formulario">
                            <h2>Visibilidad del Libro</h2>
                            <div className="visibilidad-opciones">
                                <div
                                    className={`opcion-visibilidad ${formData.esPublico ? 'activa' : ''}`}
                                    onClick={() => handleVisibilidadChange(true)}
                                >
                                    <div className="icono-opcion">🌍</div>
                                    <h3>Público</h3>
                                    <p>Todos los usuarios podrán ver este libro en el explorador</p>
                                </div>

                                <div
                                    className={`opcion-visibilidad ${!formData.esPublico ? 'activa' : ''}`}
                                    onClick={() => handleVisibilidadChange(false)}
                                >
                                    <div className="icono-opcion">🔒</div>
                                    <h3>Privado</h3>
                                    <p>Solo tú y los miembros de tu biblioteca podrán verlo</p>
                                </div>
                            </div>
                        </div>

                        {!formData.esPublico && (
                            <div className="seccion-formulario">
                                <h2>Selecciona una Biblioteca</h2>
                                <div className="grupo-input">
                                    <label htmlFor="idBiblioteca">Biblioteca *</label>
                                    <select
                                        id="idBiblioteca"
                                        name="idBiblioteca"
                                        value={formData.idBiblioteca}
                                        onChange={handleInputChange}
                                        className="select-biblioteca"
                                    >
                                        <option value="">Selecciona una biblioteca...</option>
                                        {bibliotecas.map(bib => (
                                            <option key={bib.id} value={bib.id}>
                                                {bib.nombre} {bib.esPublica ? '🌍' : '🔒'}
                                            </option>
                                        ))}
                                    </select>
                                    {bibliotecas.length === 0 && (
                                        <small className="aviso">⚠️ No tienes bibliotecas. Crea una primero.</small>
                                    )}
                                </div>
                            </div>
                        )}

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
            </div>
        </div>
    );
}

export default AnadirLibro;