package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class LibroService {

    private static final Logger logger = LoggerFactory.getLogger(LibroService.class);

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Transactional
    public Libro subirLibro(String titulo, String autor, String descripcion,
                            Long idUsuario, Boolean esPublico, Long idBiblioteca,
                            MultipartFile archivoPdf, MultipartFile portada) {

        logger.info("Iniciando subida de libro: {}", titulo);

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        Libro libro = new Libro();
        libro.setTitulo(titulo);
        libro.setAutor(autor);
        libro.setDescripcion(descripcion);
        libro.setAgregador(usuario);
        libro.setEsPublico(esPublico != null ? esPublico : false);

        if (!libro.getEsPublico()) {
            if (idBiblioteca == null) {
                throw new RuntimeException("Los libros privados deben estar en una biblioteca");
            }
            Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                    .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada con ID: " + idBiblioteca));
            libro.setBiblioteca(biblioteca);
        }

        if (archivoPdf != null && !archivoPdf.isEmpty()) {
            try {
                logger.info("Subiendo PDF a Cloudinary...");
                String urlPdf = cloudinaryService.subirArchivo(archivoPdf);
                libro.setRutaPdf(urlPdf);
                logger.info("PDF subido exitosamente: {}", urlPdf);
            } catch (IOException e) {
                logger.error("Error al subir PDF a Cloudinary", e);
                throw new RuntimeException("Error al subir PDF a Cloudinary: " + e.getMessage());
            }
        }

        if (portada != null && !portada.isEmpty()) {
            try {
                logger.info("Subiendo portada a Cloudinary...");
                String urlPortada = cloudinaryService.subirArchivo(portada);
                libro.setRutaPortada(urlPortada);
                logger.info("Portada subida exitosamente: {}", urlPortada);
            } catch (IOException e) {
                logger.error("Error al subir portada a Cloudinary", e);
                throw new RuntimeException("Error al subir portada a Cloudinary: " + e.getMessage());
            }
        }

        Libro libroGuardado = libroRepository.save(libro);
        logger.info("Libro guardado exitosamente con ID: {}", libroGuardado.getId());
        return libroGuardado;
    }

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

    @Transactional
    public void eliminarLibro(Long id) {
        logger.info("Eliminando libro con ID: {}", id);
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con ID: " + id));

        libroRepository.delete(libro);
        logger.info("Libro eliminado exitosamente");
    }

    @Transactional
    public void eliminarLibroDeUsuario(Long idLibro, Long idUsuario) {

        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con ID: " + idLibro));

        if (!libro.getAgregador().getId().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para eliminar este libro");
        }

        if (libro.getBiblioteca() != null) {
            Biblioteca b = libro.getBiblioteca();
            b.getLibros().remove(libro);
            bibliotecaRepository.save(b);
        }

        libroRepository.delete(libro);
    }
}