"use client"

import { useState } from "react"
import "./anadir-libro.css"

function AnadirLibros({ usuario }) {
  // ============== ESTADOS ==============
  // Datos del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    descripcion: "",
  })

  // Archivo PDF seleccionado
  const [archivoPDF, setArchivoPDF] = useState(null)
  // Portada seleccionada (imagen)
  const [portada, setPortada] = useState(null)
  // Preview de la imagen
  const [previewPortada, setPreviewPortada] = useState(null)
  // Mensaje de éxito o error
  const [mensaje, setMensaje] = useState("")
  // Estado de carga
  const [cargando, setCargando] = useState(false)

  // ============== MANEJADORES DE CAMBIOS ==============

  // Actualiza los campos de texto (título, autor, descripción)
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpiar mensaje cuando el usuario empieza a escribir
    setMensaje("")
  }

  // Valida y guarda el archivo PDF
  const handlePDFChange = (e) => {
    const archivo = e.target.files[0]

    // Verificar que existe un archivo
    if (!archivo) {
      setArchivoPDF(null)
      return
    }

    // Verificar que es un PDF
    if (archivo.type !== "application/pdf") {
      setMensaje("⚠️ Solo se permiten archivos PDF")
      setArchivoPDF(null)
      return
    }

    // Verificar tamaño (máximo 50MB)
    if (archivo.size > 50 * 1024 * 1024) {
      setMensaje("⚠️ El archivo es muy grande (máximo 50MB)")
      setArchivoPDF(null)
      return
    }

    // Si pasa todas las validaciones, guardar el archivo
    setArchivoPDF(archivo)
    setMensaje("✅ PDF cargado correctamente")
  }

  // Valida y guarda la portada (imagen)
  const handlePortadaChange = (e) => {
    const archivo = e.target.files[0]

    if (!archivo) {
      setPortada(null)
      setPreviewPortada(null)
      return
    }

    // Verificar que es una imagen
    if (!archivo.type.startsWith("image/")) {
      setMensaje("⚠️ Solo se permiten imágenes")
      setPortada(null)
      setPreviewPortada(null)
      return
    }

    // Verificar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje("⚠️ La imagen es muy grande (máximo 5MB)")
      setPortada(null)
      setPreviewPortada(null)
      return
    }

    // Guardar archivo y crear preview
    setPortada(archivo)

    // Crear URL temporal para mostrar preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewPortada(event.target.result)
    }
    reader.readAsDataURL(archivo)
    setMensaje("✅ Portada cargada correctamente")
  }

  // ============== ENVIAR FORMULARIO ==============
  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje("")

    // Validaciones
    if (!formData.titulo.trim()) {
      setMensaje("⚠️ Debes ingresar un título")
      setCargando(false)
      return
    }

    if (!formData.autor.trim()) {
      setMensaje("⚠️ Debes ingresar el autor")
      setCargando(false)
      return
    }

    if (!archivoPDF) {
      setMensaje("⚠️ Debes seleccionar un archivo PDF")
      setCargando(false)
      return
    }

    if (!portada) {
      setMensaje("⚠️ Debes seleccionar una portada")
      setCargando(false)
      return
    }

    try {
      // Crear FormData para enviar archivos
      const datos = new FormData()
      datos.append("titulo", formData.titulo)
      datos.append("autor", formData.autor)
      datos.append("descripcion", formData.descripcion)
      datos.append("archivoPDF", archivoPDF)
      datos.append("portada", portada)
      datos.append("usuarioId", usuario.id)

      // Enviar al servidor
      const API_URL = process.env.REACT_APP_API_URL
      const response = await fetch(`${API_URL}/api/libros/crear`, {
        method: "POST",
        body: datos, // Nota: NO incluir 'Content-Type' cuando usas FormData
      })

      const resultado = await response.json()

      if (response.ok) {
        setMensaje("✅ ¡Libro agregado exitosamente!")
        // Limpiar formulario
        setFormData({ titulo: "", autor: "", descripcion: "" })
        setArchivoPDF(null)
        setPortada(null)
        setPreviewPortada(null)
      } else {
        setMensaje(`❌ Error: ${resultado.mensaje || "No se pudo agregar el libro"}`)
      }
    } catch (error) {
      console.error("Error al agregar libro:", error)
      setMensaje("❌ Error de conexión con el servidor")
    } finally {
      setCargando(false)
    }
  }

  // ============== RENDERIZADO ==============
  return (
    <div className="anadir-libros-container">
      <header className="header-anadir">
        <h1>
          AGREGAR <span>NUEVO LIBRO</span>
        </h1>
        <p>Comparte tus libros favoritos con la comunidad</p>
      </header>

      <form className="formulario-libro" onSubmit={handleSubmit}>
        {/* ---- SECCIÓN 1: INFORMACIÓN DEL LIBRO ---- */}
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
              maxLength="100"
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
              maxLength="100"
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="descripcion">Descripción (Opcional)</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Cuéntanos sobre este libro..."
              rows="4"
              maxLength="500"
            />
            <span className="contador-caracteres">{formData.descripcion.length}/500</span>
          </div>
        </div>

        {/* ---- SECCIÓN 2: CARGA DE ARCHIVOS ---- */}
        <div className="seccion-formulario">
          <h2>Archivos del Libro</h2>

          {/* Carga del PDF */}
          <div className="grupo-input grupo-archivo">
            <label htmlFor="archivoPDF">Archivo PDF *</label>
            <div className="contenedor-carga">
              <input
                type="file"
                id="archivoPDF"
                name="archivoPDF"
                accept=".pdf"
                onChange={handlePDFChange}
                style={{ display: "none" }}
              />
              <label htmlFor="archivoPDF" className="label-archivo">
                <span className="icono-archivo">📄</span>
                <span className="texto-archivo">
                  {archivoPDF ? `Archivo: ${archivoPDF.name}` : "Selecciona un archivo PDF"}
                </span>
              </label>
            </div>
            <small>Solo se aceptan archivos PDF (máximo 50MB)</small>
          </div>

          {/* Carga de portada */}
          <div className="grupo-input grupo-archivo">
            <label htmlFor="portada">Portada del Libro *</label>
            <div className="contenedor-carga">
              <input
                type="file"
                id="portada"
                name="portada"
                accept="image/*"
                onChange={handlePortadaChange}
                style={{ display: "none" }}
              />
              <label htmlFor="portada" className="label-archivo">
                <span className="icono-archivo">🖼️</span>
                <span className="texto-archivo">{portada ? `Imagen: ${portada.name}` : "Selecciona una imagen"}</span>
              </label>
            </div>
            <small>Formatos: JPG, PNG (máximo 5MB)</small>
          </div>

          {/* Preview de la portada */}
          {previewPortada && (
            <div className="preview-portada">
              <img src={previewPortada || "/placeholder.svg"} alt="Preview portada" />
            </div>
          )}
        </div>

        {/* ---- MENSAJES DE ESTADO ---- */}
        {mensaje && <div className={`mensaje ${mensaje.includes("✅") ? "exito" : "error"}`}>{mensaje}</div>}

        {/* ---- BOTÓN ENVIAR ---- */}
        <button type="submit" className="boton-enviar" disabled={cargando}>
          {cargando ? "Agregando libro..." : "Agregar Libro"}
        </button>
      </form>
    </div>
  )
}

export default AnadirLibros
