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

    // -------------------------------------------------------------
    // ESTADOS
    // -------------------------------------------------------------
    const [libros, setLibros] = useState([]);
    const [bibliotecas, setBibliotecas] = useState([]);
    const [bibliotecasSeguidas, setBibliotecasSeguidas] = useState([]);
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
    const [vistaActiva, setVistaActiva] = useState(VISTA_TIPOS.MIS_BIBLIOTECAS);

    // -------------------------------------------------------------
    // CARGAR MIS LIBROS
    // -------------------------------------------------------------
    useEffect(() => {
        if (usuario && usuario.id) cargarLibros();
    }, [usuario]);

    const cargarLibros = async () => {
        try {
            const response = await fetch(`${API_URL}/api/libros/mis-libros/${usuario.id}`);
            const data = await response.json();
            setLibros(data);
        } catch (err) {
            console.error("Error al cargar mis libros", err);
        }
    };

    // -------------------------------------------------------------
    // CARGAR BIBLIOTECAS
    // -------------------------------------------------------------
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

            if (Array.isArray(data)) {
                setBibliotecas(data);
            } else {
                setBibliotecas([]);
            }
        } catch (err) {
            console.error("Error al cargar bibliotecas", err);
        }
    };

    const cargarBibliotecasSeguidas = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bibliotecas/listar`);
            const data = await response.json();

            if (Array.isArray(data)) {
                const seguidas = data.filter(b =>
                    b.seguidores &&
                    b.seguidores.some(s => s.id === usuario.id) &&
                    b.creador.id !== usuario.id
                );
                setBibliotecasSeguidas(seguidas);
            }
        } catch (err) {
            console.error("Error al cargar bibliotecas seguidas", err);
        }
    };

    // -------------------------------------------------------------
    // UTILIDADES
    // -------------------------------------------------------------
    const obtenerColorLibro = (id) => {
        const colores = 8;
        return `color-${(id % colores) + 1}`;
    };

    // -------------------------------------------------------------
    // FILTRADO GENERAL
    // -------------------------------------------------------------
    const contenidoFiltrado = useMemo(() => {

        const misBibliotecas = bibliotecas.filter(b => b.creador?.id === usuario.id);

        switch (vistaActiva) {

            case VISTA_TIPOS.MIS_LIBROS:
                return {
                    tipo: VISTA_TIPOS.MIS_LIBROS,
                    contenido: libros
                };

            case VISTA_TIPOS.MIS_BIBLIOTECAS:
                return {
                    tipo: VISTA_TIPOS.MIS_BIBLIOTECAS,
                    contenido: misBibliotecas
                };

            case VISTA_TIPOS.SEGUIDOS:
                return {
                    tipo: VISTA_TIPOS.SEGUIDOS,
                    contenido: bibliotecasSeguidas
                };

            default:
                return { tipo: vistaActiva, contenido: [] };
        }

    }, [libros, bibliotecas, bibliotecasSeguidas, vistaActiva, usuario]);

    // -------------------------------------------------------------
    // MODALES
    // -------------------------------------------------------------
    const abrirModalCrear = () => {
        setMostrarModalCrear(true);
        setFormData({ nombre: '', descripcion: '', esPublica: false });
    };

    const cerrarModalCrear = () => {
        setMostrarModalCrear(false);
        setMensaje('');
        setCargando(false);
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
            setMensaje("El nombre es obligatorio");
            return;
        }

        setCargando(true);

        try {
            const body = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                esPublica: formData.esPublica,
                idUsuario: usuario.id
            };

            const response = await fetch(`${API_URL}/api/bibliotecas/crear`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                setMensaje("Biblioteca creada");
                setTimeout(() => {
                    cerrarModalCrear();
                    cargarBibliotecas();
                }, 1000);
            } else {
                setMensaje("Error al crear biblioteca");
            }

        } catch (err) {
            console.error(err);
            setMensaje("Error de conexión");
        } finally {
            setCargando(false);
        }
    };

    // -------------------------------------------------------------
    // BIBLIOTECA EXPANDIDA
    // -------------------------------------------------------------
    const expandirBiblioteca = (b) => setBibliotecaExpandida(b);
    const cerrarExpandida = () => setBibliotecaExpandida(null);

    const abrirLibro = (libro, e) => {
        e.stopPropagation();
        setLibroAbierto(libro);
    };

    const cerrarLibro = () => setLibroAbierto(null);

    const handleImageError = (e, id) => {
        e.target.style.display = "none";
        const placeholder = e.target.nextSibling;
        if (placeholder) placeholder.classList.add("visible");
    };

    if (!usuario) {
        return <div className="perfil-wrapper">Cargando usuario...</div>;
    }

    // -------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------
    return (
        <div className="perfil-wrapper">
            <div className="perfil-container">

                {/* ENCABEZADO PERFIL */}
                <header className="perfil-header">
                    <h1 className="titulo">Perfil de <span className="highlight">@{usuario.username}</span></h1>
                    <p className="subtitulo">Gestiona tus bibliotecas y libros</p>
                </header>

                {/* CARD DE USUARIO */}
                <div className="perfil-card">
                    <div className="avatar-placeholder">
                        <span className="avatar-inicial">{usuario.username[0].toUpperCase()}</span>
                    </div>

                    <h2 className="nombre-usuario">@{usuario.username}</h2>
                    <p className="correo-usuario">{usuario.email}</p>

                    <div className="perfil-stats">
                        <div className="stat-item">
                            <span className="stat-numero">
                                {bibliotecas.filter(b => b.creador?.id === usuario.id).length}
                            </span>
                            <span className="stat-label">Bibliotecas</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-numero">{bibliotecasSeguidas.length}</span>
                            <span className="stat-label">Seguidos</span>
                        </div>
                    </div>
                </div>

                {/* MENU */}
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

                {/* CONTENIDO */}
                <section className="bibliotecas-section">

                    <div className="bibliotecas-header">

                        <h2 className="bibliotecas-titulo">
                            {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS && 'Mis Bibliotecas'}
                            {vistaActiva === VISTA_TIPOS.MIS_LIBROS && 'Mis Libros'}
                            {vistaActiva === VISTA_TIPOS.SEGUIDOS && 'Bibliotecas que sigues'}
                        </h2>

                        {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS && (
                            <button
                                className="btn-nueva-biblioteca-header"
                                onClick={abrirModalCrear}
                            >
                                Nueva Biblioteca
                            </button>
                        )}
                    </div>

                    {/* VISTA MIS LIBROS */}
                    {vistaActiva === VISTA_TIPOS.MIS_LIBROS && (
                        <div className="mis-libros-container">
                            {libros.length === 0 ? (
                                <div className="mensaje-info">No has añadido libros.</div>
                            ) : (
                                <div className="bibliotecas-container">
                                    {libros.map(libro => (
                                        <div key={libro.id} className="biblioteca-card">
                                            <div className="libro-mini-wrapper">
                                                <img
                                                    src={libro.rutaPortada}
                                                    alt={libro.titulo}
                                                    className="mini-portada"
                                                    onClick={(e) => abrirLibro(libro, e)}
                                                    onError={(e) => handleImageError(e, libro.id)}
                                                />
                                                <div className={`libro-placeholder ${obtenerColorLibro(libro.id)}`}>
                                                    Libro
                                                </div>
                                            </div>
                                            <p className="biblioteca-nombre">{libro.titulo}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* VISTA BIBLIOTECAS / SEGUIDOS */}
                    {(vistaActiva !== VISTA_TIPOS.MIS_LIBROS) && (
                        contenidoFiltrado.contenido.length === 0 ?
                            <div className="mensaje-info">
                                {vistaActiva === VISTA_TIPOS.MIS_BIBLIOTECAS
                                    ? "No tienes bibliotecas aún."
                                    : "No sigues ninguna biblioteca."}
                            </div>
                            :
                            <div className="bibliotecas-container">
                                {contenidoFiltrado.contenido.map(biblioteca => (
                                    <div
                                        key={biblioteca.id}
                                        className="biblioteca-card"
                                        onClick={() => expandirBiblioteca(biblioteca)}
                                    >
                                        <div className="biblioteca-header-card">
                                            <span className="icono">
                                                {biblioteca.esPublica ? 'Publica' : 'Privada'}
                                            </span>
                                            <h3 className="biblioteca-nombre">{biblioteca.nombre}</h3>
                                        </div>

                                        <p className="biblioteca-descripcion">
                                            {biblioteca.descripcion || 'Sin descripción'}
                                        </p>

                                        <div className="mini-estanteria">
                                            {biblioteca.libros?.length > 0 ? (
                                                biblioteca.libros.slice(0, 6).map(libro => (
                                                    <div key={libro.id} className="libro-mini-wrapper">
                                                        <img
                                                            src={libro.rutaPortada}
                                                            alt={libro.titulo}
                                                            className="mini-portada"
                                                            onError={(e) => handleImageError(e, libro.id)}
                                                        />
                                                        <div className={`libro-placeholder ${obtenerColorLibro(libro.id)}`}>
                                                            Libro
                                                        </div>
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
                                            <span className="cantidad">
                                                Libros: {biblioteca.libros?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                    )}

                </section>
            </div>

            {/* MODAL CREAR */}
            {mostrarModalCrear && (
                <div className="modal-crear-biblioteca" onClick={cerrarModalCrear}>
                    <div className="modal-crear-contenido" onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva Biblioteca</h2>

                        {mensaje && (
                            <div className={mensaje.includes("Error") ? "mensaje-error" : "mensaje-exito"}>
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
                                placeholder="Nombre de la biblioteca"
                            />
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                placeholder="Descripción"
                            />
                        </div>

                        <div className="form-group">
                            <label>Visibilidad</label>
                            <div className="visibilidad-opciones">
                                <div
                                    className={`opcion-visibilidad ${!formData.esPublica ? 'activa' : ''}`}
                                    onClick={() => handleVisibilidadChange(false)}
                                >
                                    Privada
                                </div>

                                <div
                                    className={`opcion-visibilidad ${formData.esPublica ? 'activa' : ''}`}
                                    onClick={() => handleVisibilidadChange(true)}
                                >
                                    Pública
                                </div>
                            </div>
                        </div>

                        <div className="modal-botones">
                            <button className="btn-modal btn-cancelar" onClick={cerrarModalCrear}>
                                Cancelar
                            </button>
                            <button className="btn-modal btn-crear" onClick={crearBiblioteca} disabled={cargando}>
                                {cargando ? "Creando..." : "Crear"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LECTOR PDF */}
            {libroAbierto && (
                <LectorLibro
                    url={libroAbierto.rutaPdf}
                    onClose={cerrarLibro}
                />
            )}

        </div>
    );
}

export default PerfilPage;
