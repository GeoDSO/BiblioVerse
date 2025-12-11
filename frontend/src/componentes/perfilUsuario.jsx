import React, { useState, useEffect, useMemo } from 'react';
import './perfilusuario.css';
import LectorLibro from './lectorlibro'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

// Definimos los tipos de vista para el filtro
const VISTA_TIPOS = {
    MIS_LIBROS: 'Mis Libros',
    MIS_BIBLIOTECAS: 'Mis Bibliotecas',
    SEGUIDOS: 'Seguidos'
};

function PerfilPage({ usuario }) {
    // --- ESTADO Y LÓGICA DE BIBLIOTECAS ---
    const [bibliotecas, setBibliotecas] = useState([]);
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
    
    // NUEVO ESTADO PARA EL FILTRO
    const [vistaActiva, setVistaActiva] = useState(VISTA_TIPOS.MIS_BIBLIOTECAS);

    useEffect(() => {
        if (usuario && usuario.id) {
            cargarBibliotecas();
        }
    }, [usuario]);

    const obtenerColorLibro = (libroId) => {
        const colores = 8;
        return `color-${(libroId % colores) + 1}`;
    };

    const cargarBibliotecas = async () => {
        if (!usuario || !usuario.id) return;
        
        try {
            const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setBibliotecas(data);
            } else {
                setBibliotecas([]);
            }
            
        } catch (error) {
            console.error('❌ Error al cargar bibliotecas:', error);
            setBibliotecas([]);
        }
    };
    
    // Lógica de filtrado (se mantiene igual)
    const contenidoFiltrado = useMemo(() => {
        if (!usuario || !usuario.id) return { tipo: vistaActiva, contenido: [] };

        const misBibliotecas = bibliotecas.filter(b => b.creador && b.creador.id === usuario.id);
        const seguidos = bibliotecas.filter(b => b.creador && b.creador.id !== usuario.id);
        
        switch (vistaActiva) {
            case VISTA_TIPOS.MIS_LIBROS:
                return {
                    tipo: VISTA_TIPOS.MIS_LIBROS,
                    mensaje: "Funcionalidad de Mis Libros (requiere listar libros individualmente).",
                    contenido: []
                };
            case VISTA_TIPOS.MIS_BIBLIOTECAS:
                return {
                    tipo: VISTA_TIPOS.MIS_BIBLIOTECAS,
                    contenido: misBibliotecas
                };
            case VISTA_TIPOS.SEGUIDOS:
                return {
                    tipo: VISTA_TIPOS.SEGUIDOS,
                    contenido: seguidos
                };
            default:
                return { tipo: vistaActiva, contenido: [] };
        }
    }, [bibliotecas, vistaActiva, usuario]); // Dependencia actualizada a 'usuario'

    // --- FUNCIONES DE MANEJO (IMPLEMENTADAS) ---
    const expandirBiblioteca = (biblioteca) => { setBibliotecaExpandida(biblioteca); };
    const cerrarExpandida = () => { setBibliotecaExpandida(null); };
    const abrirLibro = (libro, e) => { e.stopPropagation(); setLibroAbierto(libro); };
    const cerrarLibro = () => { setLibroAbierto(null); };
    
    const abrirModalCrear = () => { setMostrarModalCrear(true); setFormData({ nombre: '', descripcion: '', esPublica: false }); setMensaje(''); };
    const cerrarModalCrear = () => { setMostrarModalCrear(false); setFormData({ nombre: '', descripcion: '', esPublica: false }); setMensaje(''); };
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); setMensaje(''); };
    const handleVisibilidadChange = (esPublica) => { setFormData(prev => ({ ...prev, esPublica })); };
    
    // Implementación COMPLETA de crearBiblioteca
    const crearBiblioteca = async () => { 
        if (!formData.nombre.trim()) {
            setMensaje('❌ El nombre es obligatorio');
            return;
        }

        if (!usuario || !usuario.id) {
            setMensaje('❌ Error: El ID del usuario no está disponible.');
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
                    cargarBibliotecas(); // Recarga para que aparezca en la lista
                }, 1500);
            } else {
                const error = await response.text();
                setMensaje(`❌ Error al crear: ${error}`);
            }
        } catch (error) {
            console.error('Error de conexión o fetch:', error);
            setMensaje('❌ Error de red o conexión al servidor.');
        } finally {
            setCargando(false);
        }
    };
    
    // Implementación COMPLETA de eliminarBiblioteca
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

    // Implementación COMPLETA de eliminarLibroDeBiblioteca
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
    // --- FIN FUNCIONES DE MANEJO ---

    if (!usuario) {
        return <div className="perfil-wrapper">No hay información de usuario disponible.</div>;
    }

    // --- RENDERIZADO PRINCIPAL UNIFICADO (El JSX se mantiene idéntico al que enviaste) ---
    return (
        <div className="perfil-wrapper">
            <div className="perfil-container">
                
                {/* 1. SECCIÓN DE INFORMACIÓN DEL USUARIO */}
                <header className="perfil-header">
                    <h1 className="titulo">👤 Perfil de <span className="highlight">@{usuario.username}</span></h1>
                    <p className="subtitulo">Información personal y tus recursos guardados.</p>
                </header>

                <div className="perfil-card">
                    <div className="avatar-placeholder">
                        <span className="avatar-inicial">
                            {usuario.username ? usuario.username[0].toUpperCase() : "U"}
                        </span>
                    </div>
                    <h2 className="nombre-usuario">@{usuario.username}</h2>
                    <p className="correo-usuario">{usuario.email}</p>
                    
                    {/* BOTÓN "NUEVA BIBLIOTECA" MOVIDO AQUÍ */}
                    <div className="perfil-acciones">
                        <button 
                            className="btn-nueva-biblioteca" 
                            onClick={abrirModalCrear}
                        >
                            + Nueva Biblioteca
                        </button>
                    </div>
                </div>
                
                {/* 2. FILTRO DE VISTAS */}
                <nav className="perfil-filtro-nav">
                    {Object.values(VISTA_TIPOS).map(tipo => (
                        <button
                            key={tipo}
                            className={`filtro-btn ${vistaActiva === tipo ? 'activo' : ''}`}
                            onClick={() => setVistaActiva(tipo)}
                        >
                            {tipo}
                        </button>
                    ))}
                </nav>

                {/* 3. SECCIÓN DE CONTENIDO FILTRADO */}
                <section className="bibliotecas-section">
                    
                    <div className="bibliotecas-header">
                        <h2 className="bibliotecas-titulo">
                            {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS ? '📚 Mis Bibliotecas' : 
                             vistaActiva === VISTA_TIPOS.MIS_LIBROS ? '📖 Mis Libros' :
                             '👥 Bibliotecas que Sigo'}
                        </h2>
                    </div>

                    {contenidoFiltrado.tipo === VISTA_TIPOS.MIS_LIBROS ? (
                        <div className="mensaje-info">
                            {contenidoFiltrado.mensaje}
                        </div>
                    ) : contenidoFiltrado.contenido.length === 0 ? (
                        <div className="mensaje-info">
                            {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS ? 
                                'Aún no tienes bibliotecas creadas.' : 
                                'No sigues ninguna biblioteca.'
                            }
                        </div>
                    ) : (
                        <div className="bibliotecas-container">
                            {/* Mostrar Tarjeta "Agregar Biblioteca" SOLO en la vista MIS_BIBLIOTECAS */}
                            {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS && (
                                <div className="biblioteca-card biblioteca-card-crear" onClick={abrirModalCrear}>
                                    <div className="icono-crear">➕</div>
                                    <h3>Agregar Biblioteca</h3>
                                </div>
                            )}

                            {/* Mapeo de Bibliotecas/Seguidos */}
                            {contenidoFiltrado.contenido.map((biblioteca) => (
                                <div 
                                    key={biblioteca.id} 
                                    className="biblioteca-card"
                                    onClick={() => expandirBiblioteca(biblioteca)}
                                >
                                    {/* ... (Tarjeta de biblioteca, idéntica al código anterior) ... */}
                                    <div className="biblioteca-header-card">
                                        <span className="icono">{biblioteca.esPublica ? '🌍' : '🔒'}</span>
                                        <h3 className="biblioteca-nombre">{biblioteca.nombre}</h3>
                                    </div>

                                    <p className="biblioteca-descripcion">
                                        {biblioteca.descripcion|| 'Sin descripción'}
                                    </p>

                                    <div className="mini-estanteria">
                                        {biblioteca.libros && biblioteca.libros.length > 0 ? (
                                            biblioteca.libros.slice(0, 6).map((libro) => (
                                                <div key={libro.id} className="libro-mini-wrapper">
                                                    <img 
                                                        src={`${API_URL}/api/libros/portada/${libro.id}`}
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
                    )}
                </section>
            
            </div> {/* Fin de perfil-container */}

            {/* MODAL CREAR BIBLIOTECA */}
            {mostrarModalCrear && (
                <div className="modal-crear-biblioteca" onClick={cerrarModalCrear}>
                    <div className="modal-crear-contenido" onClick={(e) => e.stopPropagation()}>
                        <h2>📚 Crear Nueva Biblioteca</h2>
                        {mensaje && (<div className={mensaje.includes('✅') ? 'mensaje-exito' : 'mensaje-error'}>{mensaje}</div>)}
                        <div className="form-group"><label>Nombre *</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Mi Biblioteca de..."/></div>
                        <div className="form-group"><label>Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Describe tu biblioteca..."/></div>
                        <div className="form-group">
                            <label>Visibilidad</label>
                            <div className="visibilidad-opciones">
                                <div className={`opcion-visibilidad ${!formData.esPublica ? 'activa' : ''}`} onClick={() => handleVisibilidadChange(false)}>
                                    <div className="icono-opcion">🔒</div><h3>Privada</h3><p>Solo tú puedes verla</p>
                                </div>
                                <div className={`opcion-visibilidad ${formData.esPublica ? 'activa' : ''}`} onClick={() => handleVisibilidadChange(true)}>
                                    <div className="icono-opcion">🌍</div><h3>Pública</h3><p>Visible en el explorador</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-botones">
                            <button className="btn-modal btn-cancelar" onClick={cerrarModalCrear}>Cancelar</button>
                            <button className="btn-modal btn-crear" onClick={crearBiblioteca} disabled={cargando}>{cargando ? 'Creando...' : 'Crear Biblioteca'}</button>
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
                                
                                {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS && (
                                    <button 
                                        className="btn-eliminar"
                                        onClick={() => eliminarBiblioteca(bibliotecaExpandida.id)}
                                    >
                                        🗑️ Eliminar Biblioteca
                                    </button>
                                )}
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
    );
}

export default PerfilPage;