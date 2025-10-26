package com.biblioverse.biblioverse;

import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import com.biblioverse.biblioverse.Seguridad.JwtUtil;
import com.biblioverse.biblioverse.Servicios.Authservice;
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
class AuthServiceTest {

    @Mock
    private UsuarioRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private Authservice authservice;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .email("geo@example.com")
                .username("geo")
                .password("hashed1234")
                .build();
    }

    // ----------------- Test register exitoso -----------------
    @Test
    void register_exitoso() {
        Mockito.when(userRepository.findByEmail("geo@example.com")).thenReturn(Optional.empty());
        Mockito.when(passwordEncoder.encode("1234")).thenReturn("hashed1234");
        Mockito.when(userRepository.save(Mockito.any(Usuario.class))).thenReturn(usuario);
        Mockito.when(jwtUtil.generateToken("geo@example.com")).thenReturn("token123");

        String token = authservice.register("geo@example.com", "geo", "1234");

        assertNotNull(token);
        assertEquals("token123", token);
    }

    // ----------------- Test register con usuario existente -----------------
    @Test
    void register_usuarioExistente() {
        Mockito.when(userRepository.findByEmail("geo@example.com")).thenReturn(Optional.of(usuario));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authservice.register("geo@example.com", "geo", "1234"));

        assertEquals("El usuario ya existe", exception.getMessage());
    }

    // ----------------- Test login exitoso -----------------
    @Test
    void login_exitoso() {
        Mockito.when(userRepository.findByEmail("geo@example.com")).thenReturn(Optional.of(usuario));
        Mockito.when(passwordEncoder.matches("1234", "hashed1234")).thenReturn(true);
        Mockito.when(jwtUtil.generateToken("geo@example.com")).thenReturn("token123");

        String token = authservice.login("geo@example.com", "1234");

        assertNotNull(token);
        assertEquals("token123", token);
    }

    // ----------------- Test login con contraseña incorrecta -----------------
    @Test
    void login_contraseñaIncorrecta() {
        Mockito.when(userRepository.findByEmail("geo@example.com")).thenReturn(Optional.of(usuario));
        Mockito.when(passwordEncoder.matches("wrong", "hashed1234")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authservice.login("geo@example.com", "wrong"));

        assertEquals("Contraseña incorrecta", exception.getMessage());
    }

    // ----------------- Test login con usuario no encontrado -----------------
    @Test
    void login_usuarioNoEncontrado() {
        Mockito.when(userRepository.findByEmail("geo@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authservice.login("geo@example.com", "1234"));

        assertEquals("Usuario no encontrado", exception.getMessage());
    }
}
