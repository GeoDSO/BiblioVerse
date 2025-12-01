package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class BibliotecaService {

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LibroRepository libroRepository;

    // ← ACTUALIZA ESTE MÉTODO (añade descripcion)
    public Biblioteca crearBiblioteca(String nombre, String descripcion, boolean esPublica, Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Biblioteca biblioteca = Biblioteca.builder()
                .nombre(nombre)
                .descripcion(descripcion)  // ← AÑADE ESTO
                .esPublica(esPublica)
                .creador(usuario)
                .usuarios(new HashSet<>())
                .libros(new HashSet<>())
                .build();

        return bibliotecaRepository.save(biblioteca);
    }

    @Transactional
    public void agregarLibro(Long idBiblioteca, Long idLibro) {
        Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));

        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        if (biblioteca.getLibros().contains(libro)) {
            throw new RuntimeException("El libro ya está en esta biblioteca");
        }

        if (libro.getEsPublico()) {
            Libro libroEnBiblioteca = Libro.builder()
                    .titulo(libro.getTitulo())
                    .autor(libro.getAutor())
                    .descripcion(libro.getDescripcion())
                    .rutaPdf(libro.getRutaPdf())
                    .rutaPortada(libro.getRutaPortada())
                    .agregador(libro.getAgregador())
                    .esPublico(false)
                    .biblioteca(biblioteca)
                    .build();

            libroRepository.save(libroEnBiblioteca);
        } else {
            libro.setBiblioteca(biblioteca);
            libroRepository.save(libro);
        }

        bibliotecaRepository.save(biblioteca);
    }

    // ← AÑADE ESTE MÉTODO (eliminar biblioteca)
    @Transactional
    public void eliminarBiblioteca(Long idBiblioteca) {
        Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));

        // Desasociar los libros de la biblioteca antes de eliminarla
        for (Libro libro : biblioteca.getLibros()) {
            libro.setBiblioteca(null);
            libroRepository.save(libro);
        }

        bibliotecaRepository.delete(biblioteca);
    }

    public List<Biblioteca> listarBibliotecas() {
        return bibliotecaRepository.findAll();
    }

    public List<Biblioteca> buscarBibliotecas(String nombre, String username) {
        if (nombre != null && username != null) {
            return bibliotecaRepository.findByNombreContainingIgnoreCaseAndCreadorUsernameContainingIgnoreCase(nombre, username);
        } else if (nombre != null) {
            return bibliotecaRepository.findByNombreContainingIgnoreCase(nombre);
        } else if (username != null) {
            return bibliotecaRepository.findByCreadorUsernameContainingIgnoreCase(username);
        } else {
            return listarBibliotecas();
        }
    }
    public void eliminarLibro(Long idBiblioteca, Long idLibro) {
        Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));

        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        biblioteca.getLibros().remove(libro);
        bibliotecaRepository.save(biblioteca);
    }
}