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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

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

    private Usuario usuario;
    private Biblioteca biblioteca;
    private Libro libro;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("geo@example.com");
        usuario.setPassword("1234");
        usuario.setRol(Rol.NORMAL);

        biblioteca = new Biblioteca();
        biblioteca.setId(1L);

        libro = new Libro();
        libro.setId(1L);
        libro.setBiblioteca(biblioteca);
    }

    // ----------------- Test registrarUsuario -----------------
    @Test
    void registrarUsuario_exitoso() {
        Mockito.when(passwordEncoder.encode("1234")).thenReturn("hashed1234");
        Mockito.when(usuarioRepository.save(Mockito.any(Usuario.class))).thenReturn(usuario);

        Usuario resultado = usuarioService.registrarUsuario(usuario);

        assertNotNull(resultado);
        assertEquals(Rol.NORMAL, resultado.getRol());
        assertEquals(usuario, resultado);
    }

    // ----------------- Test login exitoso -----------------
    @Test
    void login_exitoso() {
        usuario.setPassword("hashed1234");
        Mockito.when(usuarioRepository.findByEmail("geo@example.com")).thenReturn(Optional.of(usuario));
        Mockito.when(passwordEncoder.matches("1234", "hashed1234")).thenReturn(true);

        Optional<Usuario> resultado = usuarioService.login("geo@example.com", "1234");

        assertTrue(resultado.isPresent());
        assertEquals(usuario, resultado.get());
    }

    // ----------------- Test login fallido -----------------
    @Test
    void login_fallido() {
        Mockito.when(usuarioRepository.findByEmail("geo@example.com")).thenReturn(Optional.empty());

        Optional<Usuario> resultado = usuarioService.login("geo@example.com", "1234");

        assertTrue(resultado.isEmpty());
    }

    // ----------------- Test compartirBiblioteca -----------------
    @Test
    void compartirBiblioteca_exitoso() {
        Mockito.when(bibliotecaRepository.findById(1L)).thenReturn(Optional.of(biblioteca));
        Mockito.when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        Mockito.when(bibliotecaRepository.save(Mockito.any(Biblioteca.class))).thenReturn(biblioteca);

        assertDoesNotThrow(() -> usuarioService.compartirBiblioteca(1L, 1L));
        assertTrue(biblioteca.getUsuarios().contains(usuario));
    }

    // ----------------- Test compartirLibro -----------------
    @Test
    void compartirLibro_exitoso() {
        Mockito.when(libroRepository.findById(1L)).thenReturn(Optional.of(libro));
        Mockito.when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        Mockito.when(bibliotecaRepository.save(Mockito.any(Biblioteca.class))).thenReturn(biblioteca);

        assertDoesNotThrow(() -> usuarioService.compartirLibro(1L, 1L));
        assertTrue(biblioteca.getUsuarios().contains(usuario));
    }
}
