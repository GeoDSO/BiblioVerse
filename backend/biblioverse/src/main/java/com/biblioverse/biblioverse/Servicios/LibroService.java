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
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    // ======================================================
    // SUBIR LIBRO (PDF + PORTADA usando CLOUDINARY)
    // ======================================================
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

        // Si es privado, debe asignarse a una biblioteca
        if (!esPublico) {
            if (idBiblioteca == null) {
                throw new RuntimeException("Los libros privados deben estar en una biblioteca");
            }
            Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                    .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));
            libro.setBiblioteca(biblioteca);
        }

        // SUBIR PDF a Cloudinary
        if (archivoPdf != null && !archivoPdf.isEmpty()) {
            try {
                String urlPdf = cloudinaryService.subirArchivo(archivoPdf);
                libro.setRutaPdf(urlPdf);  // Guardamos la URL
            } catch (IOException e) {
                throw new RuntimeException("Error al subir PDF a Cloudinary: " + e.getMessage());
            }
        }

        // SUBIR portada a Cloudinary
        if (portada != null && !portada.isEmpty()) {
            try {
                String urlPortada = cloudinaryService.subirArchivo(portada);
                libro.setRutaPortada(urlPortada);
            } catch (IOException e) {
                throw new RuntimeException("Error al subir portada a Cloudinary: " + e.getMessage());
            }
        }

        return libroRepository.save(libro);
    }

    // ======================================================
    // LISTAR LIBROS
    // ======================================================
    public List<Libro> listarLibros() {
        return libroRepository.findAll();
    }

    public List<Libro> listarLibrosPublicos() {
        return libroRepository.findAll().stream()
                .filter(Libro::getEsPublico)
                .collect(Collectors.toList());
    }

    public List<Libro> listarLibrosDeUsuario(Long idUsuario) {
        return libroRepository.findByAgregadorId(idUsuario);
    }

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

    public Libro obtenerLibroPorId(Long id) {
        return libroRepository.findById(id).orElse(null);
    }

    // ======================================================
    // YA NO LEEMOS ARCHIVOS LOCALES ≠ CLOUDINARY
    // ======================================================
    public byte[] obtenerPortada(Long id) {
        return null; // Ya no aplica, ahora se usa URL
    }

    public List<Libro> buscarLibros(String titulo, String autor) {
        if (titulo != null && autor != null) {
            return libroRepository.findByTituloContainingIgnoreCaseAndAutorContainingIgnoreCase(titulo, autor);
        } else if (titulo != null) {
            return libroRepository.findByTituloContainingIgnoreCase(titulo);
        } else if (autor != null) {
            return libroRepository.findByAutorContainingIgnoreCase(autor);
        } else {
            return listarLibros();
        }
    }


    public byte[] obtenerPDF(Long id) {
        return null; // Igual, ahora el frontend obtiene la URL directamente
    }

    // ======================================================
    // ELIMINAR LIBRO
    // ======================================================
    @Transactional
    public void eliminarLibro(Long id) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con id: " + id));

        // Ya NO se eliminan archivos locales → Cloudinary mantiene su copia
        libroRepository.delete(libro);
    }


    @Transactional
    public void eliminarLibroDeUsuario(Long idLibro, Long idUsuario) {
        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        // Validar que el usuario sea el dueño
        if (!libro.getAgregador().getId().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para eliminar este libro");
        }

        // Quitar el libro de la biblioteca si tiene una
        if (libro.getBiblioteca() != null) {
            Biblioteca b = libro.getBiblioteca();
            b.getLibros().remove(libro);
            bibliotecaRepository.save(b);
        }

        // Finalmente borrar de la BD
        libroRepository.delete(libro);
    }

}
