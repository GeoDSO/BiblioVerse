package com.biblioverse.biblioverse;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Rol;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import com.biblioverse.biblioverse.Servicios.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private BibliotecaRepository bibliotecaRepository;

    @Mock
    private LibroRepository libroRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuarioSeguidor;
    private Usuario usuarioSeguido;
    private Biblioteca biblioteca;
    private Libro libro;

    @BeforeEach
    void setUp() {
        // Usuario 1: Seguidor/Compartidor (el que ejecuta la acción)
        usuarioSeguidor = new Usuario();
        usuarioSeguidor.setId(1L);
        usuarioSeguidor.setEmail("geo@example.com");
        usuarioSeguidor.setPassword("1234");
        usuarioSeguidor.setRol(Rol.NORMAL);
        usuarioSeguidor.setSeguidos(new HashSet<>());
        usuarioSeguidor.setBibliotecasSeguidas(new HashSet<>());
        usuarioSeguidor.setSeguidores(new HashSet<>());

        // Usuario 2: Seguido/Receptor
        usuarioSeguido = new Usuario();
        usuarioSeguido.setId(2L);
        usuarioSeguido.setEmail("otro@example.com");
        usuarioSeguido.setSeguidos(new HashSet<>());
        usuarioSeguido.setBibliotecasSeguidas(new HashSet<>());
        usuarioSeguido.setSeguidores(new HashSet<>());

        biblioteca = new Biblioteca();
        biblioteca.setId(10L);
        biblioteca.setUsuarios(new HashSet<>());

        libro = new Libro();
        libro.setId(20L);
        libro.setBiblioteca(biblioteca);
    }

    // ----------------- Test registrarUsuario -----------------
    @Test
    void registrarUsuario_exitoso() {
        when(passwordEncoder.encode("1234")).thenReturn("hashed1234");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioSeguidor);

        Usuario resultado = usuarioService.registrarUsuario(usuarioSeguidor);

        assertNotNull(resultado);
        assertEquals(Rol.NORMAL, resultado.getRol());
        assertEquals(usuarioSeguidor, resultado);
    }

    // ----------------- Test login exitoso -----------------
    @Test
    void login_exitoso() {
        usuarioSeguidor.setPassword("hashed1234");
        when(usuarioRepository.findByEmail("geo@example.com")).thenReturn(Optional.of(usuarioSeguidor));
        when(passwordEncoder.matches("1234", "hashed1234")).thenReturn(true);

        Optional<Usuario> resultado = usuarioService.login("geo@example.com", "1234");

        assertTrue(resultado.isPresent());
        assertEquals(usuarioSeguidor, resultado.get());
    }

    // ----------------- Test login fallido -----------------
    @Test
    void login_fallido() {
        when(usuarioRepository.findByEmail("geo@example.com")).thenReturn(Optional.empty());

        Optional<Usuario> resultado = usuarioService.login("geo@example.com", "1234");

        assertTrue(resultado.isEmpty());
    }

    // ----------------- Test compartirBiblioteca -----------------
    @Test
    void compartirBiblioteca_exitoso() {
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(bibliotecaRepository.save(any(Biblioteca.class))).thenReturn(biblioteca);

        assertDoesNotThrow(() -> usuarioService.compartirBiblioteca(10L, 1L));
        assertTrue(biblioteca.getUsuarios().contains(usuarioSeguidor));
        verify(bibliotecaRepository, times(1)).save(biblioteca);
    }

    // ----------------- Test compartirLibro -----------------
    @Test
    void compartirLibro_exitoso() {
        when(libroRepository.findById(20L)).thenReturn(Optional.of(libro));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(bibliotecaRepository.save(any(Biblioteca.class))).thenReturn(biblioteca);

        assertDoesNotThrow(() -> usuarioService.compartirLibro(20L, 1L));
        assertTrue(biblioteca.getUsuarios().contains(usuarioSeguidor));
        verify(bibliotecaRepository, times(1)).save(biblioteca);
    }

    // =========================================================================
    // TESTS DE SEGUIMIENTO (FOLLOW)
    // =========================================================================

    // ----------------- seguirUsuario -----------------

    @Test
    void seguirUsuario_exitoso() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioSeguido));

        // Act
        usuarioService.seguirUsuario(1L, 2L);

        // Assert
        assertTrue(usuarioSeguidor.getSeguidos().contains(usuarioSeguido));
        verify(usuarioRepository, times(1)).save(usuarioSeguidor);
    }

    @Test
    void seguirUsuario_yaSigue_lanzaExcepcion() {
        // Arrange
        usuarioSeguidor.getSeguidos().add(usuarioSeguido);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioSeguido));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                usuarioService.seguirUsuario(1L, 2L));

        assertEquals("Ya estás siguiendo a este usuario", exception.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void seguirUsuario_seguidorNoEncontrado_lanzaExcepcion() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                usuarioService.seguirUsuario(1L, 2L));
    }

    @Test
    void seguirUsuario_seguidoNoEncontrado_lanzaExcepcion() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                usuarioService.seguirUsuario(1L, 2L));
    }
    @Test
    void seguirUsuario_mismoUsuario_lanzaExcepcion() {
        // Ya no es necesario simular el repositorio, ya que el servicio lanza la excepción
        // ANTES de llamar a findById().

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                usuarioService.seguirUsuario(1L, 1L)); // Seguidor ID 1, Seguido ID 1

        assertEquals("No puedes seguirte a ti mismo", exception.getMessage());

        // Además, verificamos que el repositorio NUNCA fue llamado.
        verify(usuarioRepository, never()).findById(anyLong());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    // ----------------- dejarDeSeguirUsuario -----------------

    @Test
    void dejarDeSeguirUsuario_exitoso() {
        // Arrange
        usuarioSeguidor.getSeguidos().add(usuarioSeguido); // Empezamos siguiendo
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioSeguido));

        // Act
        usuarioService.dejarDeSeguirUsuario(1L, 2L);

        // Assert
        assertFalse(usuarioSeguidor.getSeguidos().contains(usuarioSeguido));
        verify(usuarioRepository, times(1)).save(usuarioSeguidor);
    }

    @Test
    void dejarDeSeguirUsuario_noSigue_lanzaExcepcion() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioSeguido));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                usuarioService.dejarDeSeguirUsuario(1L, 2L));

        assertEquals("No estás siguiendo a este usuario", exception.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    // ----------------- seguirBiblioteca -----------------

    @Test
    void seguirBiblioteca_exitoso() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));

        // Act
        usuarioService.seguirBiblioteca(1L, 10L);

        // Assert
        assertTrue(usuarioSeguidor.getBibliotecasSeguidas().contains(biblioteca));
        verify(usuarioRepository, times(1)).save(usuarioSeguidor);
    }

    @Test
    void seguirBiblioteca_yaSigue_lanzaExcepcion() {
        // Arrange
        usuarioSeguidor.getBibliotecasSeguidas().add(biblioteca);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                usuarioService.seguirBiblioteca(1L, 10L));

        assertEquals("Ya estás siguiendo esta biblioteca", exception.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    // ----------------- dejarDeSeguirBiblioteca -----------------

    @Test
    void dejarDeSeguirBiblioteca_exitoso() {
        // Arrange
        usuarioSeguidor.getBibliotecasSeguidas().add(biblioteca);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));

        // Act
        usuarioService.dejarDeSeguirBiblioteca(1L, 10L);

        // Assert
        assertFalse(usuarioSeguidor.getBibliotecasSeguidas().contains(biblioteca));
        verify(usuarioRepository, times(1)).save(usuarioSeguidor);
    }

    @Test
    void dejarDeSeguirBiblioteca_noSigue_lanzaExcepcion() {
        // Arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioSeguidor));
        when(bibliotecaRepository.findById(10L)).thenReturn(Optional.of(biblioteca));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                usuarioService.dejarDeSeguirBiblioteca(1L, 10L));

        assertEquals("No estás siguiendo esta biblioteca", exception.getMessage());
        verify(usuarioRepository, never()).save(any());
    }
}