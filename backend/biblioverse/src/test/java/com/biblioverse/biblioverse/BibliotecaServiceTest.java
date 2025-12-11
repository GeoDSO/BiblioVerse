package com.biblioverse.biblioverse;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import com.biblioverse.biblioverse.Servicios.BibliotecaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class BibliotecaServiceTest {

    @Mock
    private BibliotecaRepository bibliotecaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private LibroRepository libroRepository;

    @InjectMocks
    private BibliotecaService bibliotecaService;

    private Usuario usuario;
    private Biblioteca biblioteca;
    private Libro libroPublico;
    private Libro libroPrivado;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setUsername("geo");

        biblioteca = Biblioteca.builder()
                .id(10L)
                .nombre("Mi Biblioteca")
                .creador(usuario)
                .libros(new HashSet<>())
                .build();

        libroPublico = Libro.builder()
                .id(100L)
                .titulo("Libro Público")
                .esPublico(true)
                .agregador(usuario)
                .build();

        libroPrivado = Libro.builder()
                .id(200L)
                .titulo("Libro Privado")
                .esPublico(false)
                .agregador(usuario)
                .build();
    }

    // ----------------- Test crearBiblioteca -----------------
    @Test
    void crearBiblioteca_exitoso() {
        // Arrange
        String nombre = "Historia";
        String descripcion = "Libros de historia";
        boolean esPublica = true;
        Long idUsuario = 1L;

        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(usuario));
        when(bibliotecaRepository.save(any(Biblioteca.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Biblioteca resultado = bibliotecaService.crearBiblioteca(nombre, descripcion, esPublica, idUsuario);

        // Assert
        assertNotNull(resultado);
        assertEquals(descripcion, resultado.getDescripcion());
        verify(bibliotecaRepository, times(1)).save(any(Biblioteca.class));
    }

    @Test
    void crearBiblioteca_usuarioNoEncontrado_lanzaExcepcion() {
        // Arrange
        when(usuarioRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
                bibliotecaService.crearBiblioteca("Test", "Desc", true, 99L));

        verify(bibliotecaRepository, never()).save(any());
    }

    // ----------------- Test agregarLibro -----------------

    @Test
    void agregarLibro_libroPrivado_exitoso() {
        // Arrange
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));
        when(libroRepository.findById(200L)).thenReturn(Optional.of(libroPrivado));

        // Act
        bibliotecaService.agregarLibro(10L, 200L);

        // Assert
        assertEquals(biblioteca, libroPrivado.getBiblioteca());
        verify(libroRepository, times(1)).save(libroPrivado);
        verify(bibliotecaRepository, times(1)).save(biblioteca);
    }

    @Test
    void agregarLibro_libroPublico_seCreaCopiaPrivada() {
        // Arrange
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));
        when(libroRepository.findById(100L)).thenReturn(Optional.of(libroPublico));
        when(libroRepository.save(any(Libro.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        bibliotecaService.agregarLibro(10L, 100L);

        // Assert: Se debe guardar una copia (será privada y tendrá biblioteca)
        verify(libroRepository, times(1)).save(argThat(libro ->
                !libro.getEsPublico() && libro.getBiblioteca().equals(biblioteca) && !libro.equals(libroPublico)
        ));
        verify(bibliotecaRepository, times(1)).save(biblioteca);
    }

    @Test
    void agregarLibro_libroYaEnBiblioteca_lanzaExcepcion() {
        // Arrange
        biblioteca.getLibros().add(libroPrivado);
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));
        when(libroRepository.findById(200L)).thenReturn(Optional.of(libroPrivado));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                bibliotecaService.agregarLibro(10L, 200L));

        assertEquals("El libro ya está en esta biblioteca", exception.getMessage());
    }

    // ----------------- Test eliminarBiblioteca -----------------

    @Test
    void eliminarBiblioteca_exitoso() {
        // Arrange
        Libro otroLibro = new Libro();
        otroLibro.setBiblioteca(biblioteca);
        Set<Libro> librosEnBib = new HashSet<>(List.of(otroLibro, libroPrivado));
        biblioteca.setLibros(librosEnBib);

        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));

        // Act
        bibliotecaService.eliminarBiblioteca(10L);

        // Assert
        assertNull(otroLibro.getBiblioteca());
        assertNull(libroPrivado.getBiblioteca());
        verify(libroRepository, times(2)).save(any(Libro.class)); // Dos libros desasociados
        verify(bibliotecaRepository, times(1)).delete(biblioteca);
    }

    @Test
    void eliminarBiblioteca_noEncontrada_lanzaExcepcion() {
        // Arrange
        when(bibliotecaRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
                bibliotecaService.eliminarBiblioteca(99L));

        verify(bibliotecaRepository, never()).delete(any());
    }

    // ----------------- Test eliminarLibro de Biblioteca -----------------

    @Test
    void eliminarLibro_deBiblioteca_exitoso() {
        // Arrange
        biblioteca.getLibros().add(libroPrivado);
        libroPrivado.setBiblioteca(biblioteca);

        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));
        when(libroRepository.findById(200L)).thenReturn(Optional.of(libroPrivado));

        // Act
        bibliotecaService.eliminarLibro(10L, 200L);

        // Assert
        assertFalse(biblioteca.getLibros().contains(libroPrivado));
        assertNull(libroPrivado.getBiblioteca());
        verify(libroRepository, times(1)).save(libroPrivado);
        verify(bibliotecaRepository, times(1)).save(biblioteca);
    }

    @Test
    void eliminarLibro_bibliotecaNoEncontrada_lanzaExcepcion() {
        when(bibliotecaRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                bibliotecaService.eliminarLibro(99L, 1L));

        verify(libroRepository, never()).save(any());
    }

    @Test
    void eliminarLibro_libroNoEncontrado_lanzaExcepcion() {
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));
        when(libroRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                bibliotecaService.eliminarLibro(10L, 99L));

        verify(libroRepository, never()).save(any());
    }

    // ----------------- Test listarBibliotecas -----------------
    @Test
    void listarBibliotecas_exitoso() {
        List<Biblioteca> bibliotecas = List.of(new Biblioteca(), new Biblioteca());
        when(bibliotecaRepository.findAll()).thenReturn(bibliotecas);

        List<Biblioteca> resultado = bibliotecaService.listarBibliotecas();

        assertEquals(2, resultado.size());
    }

    // ----------------- Test buscarBibliotecas -----------------
    @Test
    void buscarBibliotecas_porNombreYUsername() {
        List<Biblioteca> bibliotecas = List.of(new Biblioteca());
        when(bibliotecaRepository.findByNombreContainingIgnoreCaseAndCreadorUsernameContainingIgnoreCase(anyString(), anyString())).thenReturn(bibliotecas);

        List<Biblioteca> resultado = bibliotecaService.buscarBibliotecas("test", "geo");

        assertEquals(1, resultado.size());
        verify(bibliotecaRepository, times(1)).findByNombreContainingIgnoreCaseAndCreadorUsernameContainingIgnoreCase("test", "geo");
    }

    @Test
    void buscarBibliotecas_sinParametros_retornaTodas() {
        List<Biblioteca> bibliotecas = List.of(new Biblioteca(), new Biblioteca(), new Biblioteca());
        when(bibliotecaRepository.findAll()).thenReturn(bibliotecas);

        List<Biblioteca> resultado = bibliotecaService.buscarBibliotecas(null, null);

        assertEquals(3, resultado.size());
        verify(bibliotecaRepository, times(1)).findAll();
    }
}