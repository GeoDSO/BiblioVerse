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

    public Biblioteca crearBiblioteca(String nombre, boolean esPublica, Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Biblioteca biblioteca = Biblioteca.builder()
                .nombre(nombre)
                .esPublica(esPublica)
                .creador(usuario)
                .usuarios(new HashSet<>())
                .libros(new HashSet<>())
                .build();

        return bibliotecaRepository.save(biblioteca);
    }

    @Transactional
    public void agregarLibro(Long idBiblioteca, Long idLibro) {
        // Buscar la biblioteca
        Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));

        // Buscar el libro
        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        // Verificar si el libro ya está en la biblioteca
        if (biblioteca.getLibros().contains(libro)) {
            throw new RuntimeException("El libro ya está en esta biblioteca");
        }

        // Si el libro es público, crear una copia para la biblioteca
        if (libro.getEsPublico()) {
            // Crear una copia del libro vinculada a esta biblioteca
            Libro libroEnBiblioteca = Libro.builder()
                    .titulo(libro.getTitulo())
                    .autor(libro.getAutor())
                    .descripcion(libro.getDescripcion())
                    .rutaPdf(libro.getRutaPdf())
                    .rutaPortada(libro.getRutaPortada())
                    .agregador(libro.getAgregador())
                    .esPublico(false)  // La copia es privada en la biblioteca
                    .biblioteca(biblioteca)
                    .build();

            libroRepository.save(libroEnBiblioteca);
        } else {
            // Si el libro ya es privado, solo actualizamos su biblioteca
            libro.setBiblioteca(biblioteca);
            libroRepository.save(libro);
        }

        bibliotecaRepository.save(biblioteca);
    }

    public List<Biblioteca> listarBibliotecas() {
        return bibliotecaRepository.findAll();
    }

    public List<Biblioteca> buscarBibliotecas(String nombre, String username) {
        if (nombre != null && username != null) {
            return bibliotecaRepository.findByNombreContainingIgnoreCaseAndCreadorUsernameContaining(nombre, username);
        } else if (nombre != null) {
            return bibliotecaRepository.findByNombreContainingIgnoreCase(nombre);
        } else if (username != null) {
            return bibliotecaRepository.findByCreadorUsernameContaining(username);
        } else {
            return listarBibliotecas();
        }
    }
}