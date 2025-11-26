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
import org.springframework.mock.web.MockMultipartFile;

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
        usuario.setUsername("geo");

        biblioteca = new Biblioteca();
        biblioteca.setId(1L);
        biblioteca.setNombre("Mi Biblioteca");
    }

    // ----------------- Test subirLibro -----------------
//    @Test
//    void subirLibro_exitoso() {
//        MockMultipartFile archivoPdf =
//                new MockMultipartFile("archivoPdf", "libro.pdf", "application/pdf", "PDF DATA".getBytes());
//
//        MockMultipartFile portada =
//                new MockMultipartFile("portada", "imagen.jpg", "image/jpeg", "IMG DATA".getBytes());
//
//        Libro libro = new Libro();
//        libro.setTitulo("Mi Libro");
//        libro.setAutor("Geo");
//        libro.setAgregador(usuario);
//
//        Mockito.when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
//        Mockito.when(libroRepository.save(Mockito.any(Libro.class))).thenReturn(libro);
//
//        Libro resultado = libroService.subirLibro(
//                "Mi Libro",
//                "Geo",
//                "Descripción de prueba",
//                1L,
//                archivoPdf,
//                portada
//        );
//
//        assertNotNull(resultado);
//        assertEquals("Mi Libro", resultado.getTitulo());
//        assertEquals("Geo", resultado.getAutor());
//        assertEquals(usuario, resultado.getAgregador());
//    }

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

    // ----------------- Test buscarLibros -----------------
    @Test
    void buscarLibros_porTitulo() {
        List<Libro> libros = List.of(new Libro(), new Libro());
        Mockito.when(libroRepository.findByTituloContainingIgnoreCase("Harry"))
                .thenReturn(libros);

        List<Libro> resultado = libroService.buscarLibros("Harry", null);

        assertEquals(2, resultado.size());
    }

    @Test
    void buscarLibros_porAgregador() {
        List<Libro> libros = List.of(new Libro());
        Mockito.when(libroRepository.findByAgregadorUsernameContaining("geo"))
                .thenReturn(libros);

        List<Libro> resultado = libroService.buscarLibros(null, "geo");

        assertEquals(1, resultado.size());
    }

    @Test
    void buscarLibros_porTituloYAgregador() {
        List<Libro> libros = List.of(new Libro());
        Mockito.when(libroRepository
                        .findByTituloContainingIgnoreCaseAndAgregadorUsernameContaining("Harry", "geo"))
                .thenReturn(libros);

        List<Libro> resultado = libroService.buscarLibros("Harry", "geo");

        assertEquals(1, resultado.size());
    }
}
