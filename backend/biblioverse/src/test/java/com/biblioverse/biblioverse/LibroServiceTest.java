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
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LibroServiceTest {

    @Mock
    private LibroRepository libroRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private BibliotecaRepository bibliotecaRepository;

    @Spy
    @InjectMocks
    private LibroService libroService;

    private Usuario usuario;
    private Usuario otroUsuario;
    private Biblioteca biblioteca;
    private Libro libroPublico;
    private Libro libroPrivado;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setUsername("geo");

        otroUsuario = new Usuario();
        otroUsuario.setId(2L);
        otroUsuario.setUsername("otro");

        biblioteca = new Biblioteca();
        biblioteca.setId(10L);
        biblioteca.setNombre("Mi Biblioteca");
        biblioteca.setCreador(usuario); // Creador ID 1

        libroPublico = Libro.builder().id(100L).esPublico(true).agregador(otroUsuario).build();
        libroPrivado = Libro.builder().id(200L).esPublico(false).agregador(usuario).biblioteca(biblioteca).build();
    }

    // ----------------- Test subirLibro -----------------
    @Test
    void subirLibro_privado_sinBiblioteca_lanzaExcepcion() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                libroService.subirLibro("T", "A", "D", 1L, false, null, null, null)
        );

        assertEquals("Los libros privados deben estar en una biblioteca", exception.getMessage());
        verify(libroRepository, never()).save(any());
    }

    // ----------------- Test listarLibros -----------------
    @Test
    void listarLibros_exitoso() {
        List<Libro> libros = List.of(new Libro(), new Libro());
        when(libroRepository.findAll()).thenReturn(libros);

        List<Libro> resultado = libroService.listarLibros();

        assertEquals(2, resultado.size());
    }

    // ----------------- Test listarLibrosPublicos -----------------
    @Test
    void listarLibrosPublicos_filtraSoloPublicos() {
        // Arrange
        Libro libro1 = Libro.builder().esPublico(true).build();
        Libro libro2 = Libro.builder().esPublico(false).build();
        Libro libro3 = Libro.builder().esPublico(true).build();
        List<Libro> todos = List.of(libro1, libro2, libro3);

        when(libroRepository.findAll()).thenReturn(todos);

        // Act
        List<Libro> resultado = libroService.listarLibrosPublicos();

        // Assert
        assertEquals(2, resultado.size());
    }

    // ----------------- Test listarLibrosVisiblesPara -----------------
    @Test
    void listarLibrosVisiblesPara_contienePublicosYPrivadosPropios() {
        // Arrange
        // ... (El bloque Arrange se mantiene igual)

        Usuario usuario2 = new Usuario();
        usuario2.setId(2L);

        Biblioteca bibOtro = new Biblioteca();
        bibOtro.setId(20L);
        // Nota: otroUsuario (ID 2) se asume inicializado en el setUp de la clase.
        bibOtro.setCreador(otroUsuario);

        // Definimos los IDs para una comparación más fácil
        Libro pub = Libro.builder().id(300L).esPublico(true).agregador(usuario2).build(); // Visible (público)
        Libro privAgregado = Libro.builder().id(301L).esPublico(false).agregador(usuario).build(); // Visible (agregado por ID 1)
        Libro privBiblioteca = Libro.builder().id(302L).esPublico(false).biblioteca(biblioteca).agregador(usuario2).build(); // Visible (en biblioteca del creador ID 1)
        Libro privOtro = Libro.builder().id(303L).esPublico(false).biblioteca(bibOtro).agregador(otroUsuario).build(); // NO Visible (privado de otro usuario)

        List<Libro> todos = List.of(pub, privAgregado, privBiblioteca, privOtro);
        when(libroRepository.findAll()).thenReturn(todos);

        // Act
        List<Libro> resultado = libroService.listarLibrosVisiblesPara(1L); // Para el usuario con ID 1

        // Assert (Comparación basada en IDs)

        // 1. Verificamos el tamaño
        assertEquals(3, resultado.size(), "Debería haber exactamente 3 libros visibles.");

        // 2. Extraemos los IDs de los resultados
        List<Long> idsResultado = resultado.stream()
                .map(Libro::getId)
                .collect(Collectors.toList());

        // 3. Definimos los IDs esperados
        List<Long> idsEsperados = List.of(300L, 301L, 302L);

        // Verificamos que los resultados contienen EXACTAMENTE los IDs esperados
        assertTrue(idsResultado.containsAll(idsEsperados), "Los IDs visibles deben incluir a los libros público, agregado y de biblioteca propia.");
        assertFalse(idsResultado.contains(303L), "No debe incluir el ID del libro privado de otro.");
    }

    // ----------------- Test obtenerLibroPorId -----------------
    @Test
    void obtenerLibroPorId_encontrado() {
        when(libroRepository.findById(100L)).thenReturn(Optional.of(libroPublico));
        Libro resultado = libroService.obtenerLibroPorId(100L);
        assertEquals(libroPublico, resultado);
    }
}