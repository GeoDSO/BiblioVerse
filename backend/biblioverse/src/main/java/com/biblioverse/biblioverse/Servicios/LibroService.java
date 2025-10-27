package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    // Subir libro: asignar "anadidoPor" correctamente
    public Libro subirLibro(String titulo, String autor, Long idUsuario, Long idBiblioteca) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));

        Libro libro = new Libro();
        libro.setTitulo(titulo);
        libro.setAutor(autor);
        libro.setAgregador(usuario);  // <-- usuario que añade
        libro.setBiblioteca(biblioteca);

        return libroRepository.save(libro);
    }

    // Listar todos los libros
    public List<Libro> listarLibros() {
        return libroRepository.findAll();
    }

    // Buscar libros por título y/o usuario que los añadió
    public List<Libro> buscarLibros(String titulo, String username) {
        if (titulo != null && username != null) {
            // Filtrar por ambos: título y usuario
            return libroRepository.findByTituloContainingIgnoreCaseAndAgregadorUsernameContaining(titulo, username);
        } else if (titulo != null) {
            return libroRepository.findByTituloContainingIgnoreCase(titulo);
        } else if (username != null) {
            return libroRepository.findByAgregadorUsernameContaining(username);
        } else {
            return listarLibros();
        }
    }
}