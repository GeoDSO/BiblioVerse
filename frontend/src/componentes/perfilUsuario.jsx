import React, { useState, useEffect, useMemo } from 'react';
import './perfilusuario.css';
import LectorLibro from './lectorlibro';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

const VISTA_TIPOS = {
    MIS_LIBROS: 'Mis Libros',
    MIS_BIBLIOTECAS: 'Mis Bibliotecas',
    SEGUIDOS: 'Seguidos'
};

function PerfilPage({ usuario }) {

    // estados
    const [libros, setLibros] = useState([]);
    const [bibliotecas, setBibliotecas] = useState([]);
    const [bibliotecasSeguidas, setBibliotecasSeguidas] = useState([]);
    const [bibliotecaExpandida, setBibliotecaExpandida] = useState(null);
    const [libroAbierto, setLibroAbierto] = useState(null);
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', esPublica: false });
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const [vistaActiva, setVistaActiva] = useState(VISTA_TIPOS.MIS_BIBLIOTECAS);

    // cargar mis libros
    useEffect(() => {
        if (usuario && usuario.id) cargarLibros();
    }, [usuario]);

    const cargarLibros = async () => {
        try {
            const response = await fetch(`${API_URL}/api/libros/mis-libros/${usuario.id}`);
            if (!response.ok) {
                console.error('Error al obtener mis libros', response.status);
                setLibros([]);
                return;
            }
            const data = await response.json();
            setLibros(data || []);
        } catch (err) {
            console.error("Error al cargar mis libros", err);
            setLibros([]);
        }
    };

    // cargar bibliotecas y seguidas (igual que antes)
    useEffect(() => {
        if (usuario && usuario.id) {
            cargarBibliotecas();
            cargarBibliotecasSeguidas();
        }
    }, [usuario]);

    const cargarBibliotecas = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
            const data = await response.json();
            setBibliotecas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar bibliotecas", err);
            setBibliotecas([]);
        }
    };

    const cargarBibliotecasSeguidas = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
            const data = await response.json();
            if (Array.isArray(data)) {
                const seguidas = data.filter(b =>
                    b.seguidores && b.seguidores.some(s => s.id === usuario.id) && b.creador.id !== usuario.id
                );
                setBibliotecasSeguidas(seguidas);
            } else {
                setBibliotecasSeguidas([]);
            }
        } catch (err) {
            console.error("Error al cargar bibliotecas seguidas", err);
            setBibliotecasSeguidas([]);
        }
    };

    const obtenerColorLibro = (id) => {
        const colores = 8;
        return `color-${(id % colores) + 1}`;
    };

    const contenidoFiltrado = useMemo(() => {
        const misBibliotecas = bibliotecas.filter(b => b.creador?.id === usuario.id);
        switch (vistaActiva) {
            case VISTA_TIPOS.MIS_LIBROS:
                return { tipo: VISTA_TIPOS.MIS_LIBROS, contenido: libros };
            case VISTA_TIPOS.MIS_BIBLIOTECAS:
                return { tipo: VISTA_TIPOS.MIS_BIBLIOTECAS, contenido: misBibliotecas };
            case VISTA_TIPOS.SEGUIDOS:
                return { tipo: VISTA_TIPOS.SEGUIDOS, contenido: bibliotecasSeguidas };
            default:
                return { tipo: vistaActiva, contenido: [] };
        }
    }, [libros, bibliotecas, bibliotecasSeguidas, vistaActiva, usuario]);

    // abrir/cerrar modales, libros
    const expandirBiblioteca = (b) => setBibliotecaExpandida(b);
    const cerrarExpandida = () => setBibliotecaExpandida(null);
    const abrirLibro = (libro, e) => { if (e) e.stopPropagation(); setLibroAbierto(libro); };
    const cerrarLibro = () => setLibroAbierto(null);

    const abrirModalCrear = () => { setMostrarModalCrear(true); setFormData({ nombre: '', descripcion: '', esPublica: false }); };
    const cerrarModalCrear = () => { setMostrarModalCrear(false); setMensaje(''); setCargando(false); };
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); setMensaje(''); };
    const handleVisibilidadChange = (esPublica) => { setFormData(prev => ({ ...prev, esPublica })); };

    const crearBiblioteca = async () => {
        if (!formData.nombre.trim()) { setMensaje("El nombre es obligatorio"); return; }
        setCargando(true);
        try {
            const body = { nombre: formData.nombre, descripcion: formData.descripcion, esPublica: formData.esPublica, idUsuario: usuario.id };
            const response = await fetch(`${API_URL}/api/bibliotecas/crear`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                setMensaje("Biblioteca creada");
                setTimeout(() => { cerrarModalCrear(); cargarBibliotecas(); }, 1000);
            } else {
                setMensaje("Error al crear biblioteca");
            }
        } catch (err) {
            console.error(err); setMensaje("Error de conexión");
        } finally { setCargando(false); }
    };

    // -------------------------------------------------------------
    // NUEVO: eliminar libro que el usuario haya subido
    // -------------------------------------------------------------
    const eliminarMiLibro = async (libroId) => {
        if (!window.confirm('¿Seguro que quieres eliminar este libro? Esta acción no se puede deshacer.')) return;

        try {
            const response = await fetch(`${API_URL}/api/libros/eliminar/${libroId}/por-usuario/${usuario.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Actualizamos UI inmediatamente
                setLibros(prev => prev.filter(l => l.id !== libroId));
                // Si el libro abierto es el eliminado, lo cerramos
                if (libroAbierto && libroAbierto.id === libroId) setLibroAbierto(null);
                alert('Libro eliminado');
            } else {
                const text = await response.text().catch(() => 'Error');
                alert('No se pudo eliminar: ' + text);
            }
        } catch (err) {
            console.error('Error al eliminar libro:', err);
            alert('Error de conexión al eliminar el libro');
        }
    };

    const handleImageError = (e, id) => {
        e.target.style.display = "none";
        const placeholder = e.target.nextSibling;
        if (placeholder) placeholder.classList.add("visible");
    };

    if (!usuario) return <div className="perfil-wrapper">Cargando usuario...</div>;

    return (
        <div className="perfil-wrapper">
            <div className="perfil-container">

                <header className="perfil-header">
                    <h1 className="titulo">Perfil de <span className="highlight">@{usuario.username}</span></h1>
                    <p className="subtitulo">Gestiona tus bibliotecas y libros</p>
                </header>

                <div className="perfil-card">
                    <div className="avatar-placeholder"><span className="avatar-inicial">{usuario.username[0].toUpperCase()}</span></div>
                    <h2 className="nombre-usuario">@{usuario.username}</h2>
                    <p className="correo-usuario">{usuario.email}</p>

                    <div className="perfil-stats">
                        <div className="stat-item">
                            <span className="stat-numero">{bibliotecas.filter(b => b.creador?.id === usuario.id).length}</span>
                            <span className="stat-label">Bibliotecas</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-numero">{bibliotecasSeguidas.length}</span>
                            <span className="stat-label">Seguidos</span>
                        </div>
                    </div>
                </div>

                <nav className="perfil-filtro-nav">
                    {Object.values(VISTA_TIPOS).map(tipo => (
                        <button key={tipo} className={`filtro-btn ${vistaActiva === tipo ? 'activo' : ''}`} onClick={() => setVistaActiva(tipo)}>
                            {tipo}
                        </button>
                    ))}
                </nav>

                <section className="bibliotecas-section">
                    <div className="bibliotecas-header">
                        <h2 className="bibliotecas-titulo">
                            {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS && 'Mis Bibliotecas'}
                            {vistaActiva === VISTA_TIPOS.MIS_LIBROS && 'Mis Libros'}
                            {vistaActiva === VISTA_TIPOS.SEGUIDOS && 'Bibliotecas que sigues'}
                        </h2>

                        {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS && (
                            <button className="btn-nueva-biblioteca-header" onClick={abrirModalCrear}>Nueva Biblioteca</button>
                        )}
                    </div>

                    {vistaActiva === VISTA_TIPOS.MIS_LIBROS && (
                        <div className="mis-libros-container">
                            {libros.length === 0 ? (
                                <div className="mensaje-info">No has añadido libros.</div>
                            ) : (
                                <div className="bibliotecas-container">
                                    {libros.map(libro => (
                                        <div key={libro.id} className="biblioteca-card" style={{ minHeight: '220px', position: 'relative' }}>
                                            <div className="libro-mini-wrapper" style={{ padding: '1rem' }}>
                                                <img
                                                    src={libro.rutaPortada}
                                                    alt={libro.titulo}
                                                    className="mini-portada"
                                                    onClick={(e) => abrirLibro(libro, e)}
                                                    onError={(e) => handleImageError(e, libro.id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <div className={`libro-placeholder ${obtenerColorLibro(libro.id)}`}>Libro</div>
                                            </div>
                                            <p className="biblioteca-nombre" style={{ padding: '0 1rem 1rem' }}>{libro.titulo}</p>

                                            {/* botón eliminar: solo visible si el usuario es el agregador */}
                                            {libro.agregador?.id === usuario.id && (
                                                <button
                                                    className="btn-eliminar-libro"
                                                    title="Eliminar libro"
                                                    onClick={(e) => { e.stopPropagation(); eliminarMiLibro(libro.id); }}
                                                    style={{ position: 'absolute', top: 12, right: 12 }}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(vistaActiva !== VISTA_TIPOS.MIS_LIBROS) && (
                        contenidoFiltrado.contenido.length === 0 ?
                            <div className="mensaje-info">
                                {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS ? "No tienes bibliotecas aún." : "No sigues ninguna biblioteca."}
                            </div>
                            :
                            <div className="bibliotecas-container">
                                {contenidoFiltrado.contenido.map(biblioteca => (
                                    <div key={biblioteca.id} className="biblioteca-card" onClick={() => expandirBiblioteca(biblioteca)}>
                                        <div className="biblioteca-header-card">
                                            <span className="icono">{biblioteca.esPublica ? 'Publica' : 'Privada'}</span>
                                            <h3 className="biblioteca-nombre">{biblioteca.nombre}</h3>
                                        </div>

                                        <p className="biblioteca-descripcion">{biblioteca.descripcion || 'Sin descripción'}</p>

                                        <div className="mini-estanteria">
                                            {biblioteca.libros?.length > 0 ? (
                                                biblioteca.libros.slice(0, 6).map(libro => (
                                                    <div key={libro.id} className="libro-mini-wrapper">
                                                        <img src={libro.rutaPortada} alt={libro.titulo} className="mini-portada" onError={(e) => handleImageError(e, libro.id)} />
                                                        <div className={`libro-placeholder ${obtenerColorLibro(libro.id)}`}>Libro</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="sin-libros-mini">Sin libros</span>
                                            )}
                                        </div>

                                        <div className="biblioteca-footer">
                                            <span className={biblioteca.esPublica ? "badge-publica" : "badge-privada"}>
                                                {biblioteca.esPublica ? "Pública" : "Privada"}
                                            </span>
                                            <span className="cantidad">Libros: {biblioteca.libros?.length || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    )}
                </section>
            </div>

            {mostrarModalCrear && (
                <div className="modal-crear-biblioteca" onClick={cerrarModalCrear}>
                    <div className="modal-crear-contenido" onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva Biblioteca</h2>
                        {mensaje && <div className={mensaje.includes("Error") ? "mensaje-error" : "mensaje-exito"}>{mensaje}</div>}
                        <div className="form-group"><label>Nombre *</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre de la biblioteca" /></div>
                        <div className="form-group"><label>Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Descripción" /></div>
                        <div className="form-group">
                            <label>Visibilidad</label>
                            <div className="visibilidad-opciones">
                                <div className={`opcion-visibilidad ${!formData.esPublica ? 'activa' : ''}`} onClick={() => handleVisibilidadChange(false)}>Privada</div>
                                <div className={`opcion-visibilidad ${formData.esPublica ? 'activa' : ''}`} onClick={() => handleVisibilidadChange(true)}>Pública</div>
                            </div>
                        </div>
                        <div className="modal-botones">
                            <button className="btn-modal btn-cancelar" onClick={cerrarModalCrear}>Cancelar</button>
                            <button className="btn-modal btn-crear" onClick={crearBiblioteca} disabled={cargando}>{cargando ? "Creando..." : "Crear"}</button>
                        </div>
                    </div>
                </div>
            )}

            {bibliotecaExpandida && (
                <div className="biblioteca-expandida" onClick={cerrarExpandida}>
                    <div className="biblioteca-expandida-contenido" onClick={(e) => e.stopPropagation()}>
                        <div className="biblioteca-expandida-header">
                            <h2><span>{bibliotecaExpandida.esPublica ? '🌍' : '🔒'}</span>{bibliotecaExpandida.nombre}</h2>
                            <button className="btn-cerrar" onClick={cerrarExpandida}>×</button>
                        </div>
                        <div className="biblioteca-expandida-body">
                            <div className="biblioteca-expandida-info">
                                <p><strong>Descripción:</strong> {bibliotecaExpandida.descripcion || 'Sin descripción'}</p>
                                <p><strong>Visibilidad:</strong> <span className={bibliotecaExpandida.esPublica ? "badge-publica" : "badge-privada"} style={{ marginLeft: '0.5rem' }}>{bibliotecaExpandida.esPublica ? 'Pública' : 'Privada'}</span></p>
                                <p><strong>Total de libros:</strong> {bibliotecaExpandida.libros?.length || 0}</p>
                            </div>

                            <div className="estanteria-grande">
                                {bibliotecaExpandida.libros && bibliotecaExpandida.libros.length > 0 ? (
                                    bibliotecaExpandida.libros.map((libro) => (
                                        <div key={libro.id} className="libro-grande" onClick={(e) => abrirLibro(libro, e)}>
                                            <div className="libro-grande-portada-wrapper">
                                                <img src={libro.rutaPortada} alt={libro.titulo} onError={(e) => handleImageError(e, libro.id)} />
                                                <div className={`libro-placeholder-grande ${obtenerColorLibro(libro.id)}`}></div>
                                            </div>
                                            <div className="libro-grande-titulo">{libro.titulo}</div>
                                        </div>
                                    ))
                                ) : <div className="sin-libros-grande">Esta biblioteca aún no tiene libros</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {libroAbierto && (
                <LectorLibro url={libroAbierto.rutaPdf} onClose={cerrarLibro} />
            )}
        </div>
    );
}

export default PerfilPage;
