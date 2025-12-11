package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional; // <-- IMPORTANTE: NUEVO IMPORT

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    // Carpeta donde se guardan los archivos
    private final String UPLOAD_DIR = "uploads/";

    public Libro subirLibro(String titulo, String autor, String descripcion,
                            Long idUsuario, Boolean esPublico, Long idBiblioteca,
                            MultipartFile archivoPdf, MultipartFile portada) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Libro libro = new Libro();
        libro.setTitulo(titulo);
        libro.setAutor(autor);
        libro.setDescripcion(descripcion);
        libro.setAgregador(usuario);
        libro.setEsPublico(esPublico);

        // Si es PRIVADO, debe tener biblioteca
        if (!esPublico) {
            if (idBiblioteca == null) {
                throw new RuntimeException("Los libros privados deben estar en una biblioteca");
            }
            Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                    .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));
            libro.setBiblioteca(biblioteca);
        }
        // Si es PÚBLICO, biblioteca queda en NULL

        // Crear directorio si no existe
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // Guardar PDF
        if (archivoPdf != null && !archivoPdf.isEmpty()) {
            String rutaPdf = guardarArchivo(archivoPdf, "pdfs");
            libro.setRutaPdf(rutaPdf);
        }

        // Guardar Portada
        if (portada != null && !portada.isEmpty()) {
            String rutaPortada = guardarArchivo(portada, "portadas");
            libro.setRutaPortada(rutaPortada);
        }

        return libroRepository.save(libro);
    }

    private String guardarArchivo(MultipartFile archivo, String carpeta) {
        try {
            // Crear carpeta específica
            String directorioCompleto = UPLOAD_DIR + carpeta + "/";
            File dir = new File(directorioCompleto);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Generar nombre único
            String extension = archivo.getOriginalFilename()
                    .substring(archivo.getOriginalFilename().lastIndexOf("."));
            String nombreUnico = UUID.randomUUID().toString() + extension;

            // Guardar archivo
            Path rutaArchivo = Paths.get(directorioCompleto + nombreUnico);
            Files.write(rutaArchivo, archivo.getBytes());

            // Retornar ruta relativa
            return "/uploads/" + carpeta + "/" + nombreUnico;

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar archivo: " + e.getMessage());
        }
    }

    public List<Libro> listarLibros() {
        return libroRepository.findAll();
    }

    /**
     * Lista solo los libros públicos (explorador)
     */
    public List<Libro> listarLibrosPublicos() {
        return libroRepository.findAll().stream()
                .filter(Libro::getEsPublico)
                .collect(Collectors.toList());
    }

    /**
     * Lista libros visibles para un usuario específico:
     * - Todos los públicos
     * - Los privados que el usuario agregó
     * - Los privados en bibliotecas del usuario
     */
    public List<Libro> listarLibrosVisiblesPara(Long idUsuario) {
        return libroRepository.findAll().stream()
                .filter(libro ->
                        libro.getEsPublico() ||
                                libro.getAgregador().getId().equals(idUsuario) ||
                                (libro.getBiblioteca() != null &&
                                        libro.getBiblioteca().getCreador().getId().equals(idUsuario))
                )
                .collect(Collectors.toList());
    }

    public List<Libro> buscarLibros(String titulo, String username) {
        if (titulo != null && username != null) {
            return libroRepository.findByTituloContainingIgnoreCaseAndAgregadorUsernameContaining(titulo, username);
        } else if (titulo != null) {
            return libroRepository.findByTituloContainingIgnoreCase(titulo);
        } else if (username != null) {
            return libroRepository.findByAgregadorUsernameContaining(username);
        } else {
            return listarLibros();
        }
    }
    // Agregar este método al final de la clase
    public Libro obtenerLibroPorId(Long id) {
        return libroRepository.findById(id).orElse(null);
    }

    // Y este método para obtener la portada como bytes
    public byte[] obtenerPortada(Long id) throws IOException {
        Libro libro = libroRepository.findById(id).orElse(null);

        if (libro == null || libro.getRutaPortada() == null) {
            return null;
        }

        // Leer el archivo de la ruta guardada
        Path rutaArchivo = Paths.get(libro.getRutaPortada().substring(1)); // Quitar el "/" inicial
        return Files.readAllBytes(rutaArchivo);
    }

    public byte[] obtenerPDF(Long id) throws IOException {
        Libro libro = libroRepository.findById(id).orElse(null);

        if (libro == null || libro.getRutaPdf() == null) {
            return null;
        }

        // Leer el archivo de la ruta guardada
        String rutaLimpia = libro.getRutaPdf().startsWith("/")
                ? libro.getRutaPdf().substring(1)
                : libro.getRutaPdf();

        Path rutaArchivo = Paths.get(rutaLimpia);

        if (!Files.exists(rutaArchivo)) {
            return null;
        }

        return Files.readAllBytes(rutaArchivo);
    }

    /**
     * Elimina un libro por ID, incluyendo sus archivos físicos (PDF y Portada).
     */
    @Transactional
    public void eliminarLibro(Long id) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con id: " + id));

        // 1. Obtener y eliminar archivos físicos
        eliminarArchivo(libro.getRutaPdf());
        eliminarArchivo(libro.getRutaPortada());

        // 2. Eliminar de la base de datos
        libroRepository.delete(libro);
    }

    /**
     * Método auxiliar para eliminar un archivo si su ruta no es nula ni vacía.
     */
    public void eliminarArchivo(String rutaRelativa) {
        if (rutaRelativa != null && !rutaRelativa.isEmpty()) {
            try {
                // La ruta guardada incluye un '/' inicial (ej: /uploads/pdfs/...)
                String rutaLimpia = rutaRelativa.startsWith("/")
                        ? rutaRelativa.substring(1) // Quitar el '/' inicial
                        : rutaRelativa;

                Path rutaArchivo = Paths.get(rutaLimpia);

                if (Files.exists(rutaArchivo)) {
                    Files.delete(rutaArchivo);
                    System.out.println("Archivo eliminado: " + rutaArchivo.toString());
                } else {
                    System.out.println("Advertencia: Archivo no encontrado para eliminar: " + rutaArchivo.toString());
                }
            } catch (IOException e) {
                // Se lanza excepción para que la transacción falle si no se puede eliminar el archivo
                throw new RuntimeException("Error al eliminar el archivo: " + rutaRelativa + ". Causa: " + e.getMessage());
            }
        }
    }
}