package com.biblioverse.biblioverse;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import com.biblioverse.biblioverse.Servicios.LibroService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class LibroServiceTest {

    @Mock
    private LibroRepository libroRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private BibliotecaRepository bibliotecaRepository;

    @InjectMocks
    private LibroService libroService;

    private Usuario usuario;
    private Biblioteca biblioteca;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);

        biblioteca = new Biblioteca();
        biblioteca.setId(1L);
    }

    // ----------------- Test subirLibro -----------------
    @Test
    void subirLibro_exitoso() {
        Libro libro = new Libro();
        libro.setTitulo("Mi Libro");
        libro.setAutor("Geo");
        libro.setCreador(usuario);
        libro.setBiblioteca(biblioteca);

        Mockito.when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        Mockito.when(bibliotecaRepository.findById(1L)).thenReturn(Optional.of(biblioteca));
        Mockito.when(libroRepository.save(Mockito.any(Libro.class))).thenReturn(libro);

        Libro resultado = libroService.subirLibro("Mi Libro", "Geo", 1L, 1L);

        assertNotNull(resultado);
        assertEquals("Mi Libro", resultado.getTitulo());
        assertEquals("Geo", resultado.getAutor());
        assertEquals(usuario, resultado.getCreador());
        assertEquals(biblioteca, resultado.getBiblioteca());
    }

    // ----------------- Test listarLibros -----------------
    @Test
    void listarLibros_exitoso() {
        List<Libro> libros = new ArrayList<>();
        libros.add(new Libro());
        libros.add(new Libro());

        Mockito.when(libroRepository.findAll()).thenReturn(libros);

        List<Libro> resultado = libroService.listarLibros();

        assertEquals(2, resultado.size());
    }
}
