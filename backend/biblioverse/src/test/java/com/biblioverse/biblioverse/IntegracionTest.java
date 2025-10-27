package com.biblioverse.biblioverse;

import com.biblioverse.biblioverse.Dtos.BibliotecaDto;
import com.biblioverse.biblioverse.Dtos.LoginRequest;
import com.biblioverse.biblioverse.Dtos.RegisterRequest;
import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Dtos.LibroDto;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IntegracionTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    @Autowired
    private LibroRepository libroRepository;

    @BeforeEach
    void setUp() {
        // Limpiar la base de datos antes de cada test
        libroRepository.deleteAll();
        bibliotecaRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void RegistraryLogearIntegration() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("test1@example.com");
        registerRequest.setUsername("test1");
        registerRequest.setPassword("1234");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<RegisterRequest> registerEntity = new HttpEntity<>(registerRequest, headers);

        ResponseEntity<Usuario> registerResponse = restTemplate.postForEntity(
                "/api/auth/register",
                registerEntity,
                Usuario.class
        );

        assertEquals(HttpStatus.OK, registerResponse.getStatusCode());
        assertNotNull(registerResponse.getBody());
        assertEquals("test1", registerResponse.getBody().getUsername());
    }

    @Test
    void CrearBibliotecaIntegration() {
        // Registrar usuario
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("test2@example.com");
        registerRequest.setUsername("test2");
        registerRequest.setPassword("1234");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<RegisterRequest> registerEntity = new HttpEntity<>(registerRequest, headers);

        ResponseEntity<Usuario> userResponse = restTemplate.postForEntity(
                "/api/auth/register",
                registerEntity,
                Usuario.class
        );
        Long userId = userResponse.getBody().getId();

        // Crear biblioteca
        BibliotecaDto bibliotecaDto = new BibliotecaDto();
        bibliotecaDto.setNombre("Biblioteca Test");
        bibliotecaDto.setEsPublica(true);
        bibliotecaDto.setIdUsuario(userId);

        HttpEntity<BibliotecaDto> biblioEntity = new HttpEntity<>(bibliotecaDto, headers);
        ResponseEntity<Biblioteca> createResponse = restTemplate.postForEntity(
                "/api/bibliotecas/crear",
                biblioEntity,
                Biblioteca.class
        );

        assertEquals(HttpStatus.OK, createResponse.getStatusCode());
        assertEquals("Biblioteca Test", createResponse.getBody().getNombre());
    }

    @Test
    void SubirLibroIntegration() {
        // Crear usuario
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("test3@example.com");
        registerRequest.setUsername("test3");
        registerRequest.setPassword("1234");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<RegisterRequest> registerEntity = new HttpEntity<>(registerRequest, headers);

        ResponseEntity<Usuario> userResponse = restTemplate.postForEntity(
                "/api/auth/register",
                registerEntity,
                Usuario.class
        );
        Long userId = userResponse.getBody().getId();

        // Crear biblioteca
        BibliotecaDto bibliotecaDto = new BibliotecaDto();
        bibliotecaDto.setNombre("Biblioteca Libros");
        bibliotecaDto.setEsPublica(true);
        bibliotecaDto.setIdUsuario(userId);

        HttpEntity<BibliotecaDto> biblioEntity = new HttpEntity<>(bibliotecaDto, headers);
        ResponseEntity<Biblioteca> biblioResponse = restTemplate.postForEntity(
                "/api/bibliotecas/crear",
                biblioEntity,
                Biblioteca.class
        );
        Long bibliotecaId = biblioResponse.getBody().getId();

        // Subir libro
        LibroDto libroDto = new LibroDto();
        libroDto.setTitulo("Test Libro");
        libroDto.setAutor("Test Autor");
        libroDto.setIdUsuario(userId);
        libroDto.setIdBiblioteca(bibliotecaId);

        HttpEntity<LibroDto> libroEntity = new HttpEntity<>(libroDto, headers);
        ResponseEntity<Libro> libroResponse = restTemplate.postForEntity(
                "/api/libros/subir",
                libroEntity,
                Libro.class
        );

        assertEquals(HttpStatus.OK, libroResponse.getStatusCode());
        assertEquals("Test Libro", libroResponse.getBody().getTitulo());
    }

    @Test
    void BuscarLibroIntegration() {
        // Crear usuario
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("test4@example.com");
        registerRequest.setUsername("test4");
        registerRequest.setPassword("1234");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<RegisterRequest> registerEntity = new HttpEntity<>(registerRequest, headers);

        ResponseEntity<Usuario> userResponse = restTemplate.postForEntity(
                "/api/auth/register",
                registerEntity,
                Usuario.class
        );
        Long userId = userResponse.getBody().getId();

        // Crear biblioteca
        BibliotecaDto bibliotecaDto = new BibliotecaDto();
        bibliotecaDto.setNombre("Biblioteca Search");
        bibliotecaDto.setEsPublica(true);
        bibliotecaDto.setIdUsuario(userId);

        HttpEntity<BibliotecaDto> biblioEntity = new HttpEntity<>(bibliotecaDto, headers);
        ResponseEntity<Biblioteca> biblioResponse = restTemplate.postForEntity(
                "/api/bibliotecas/crear",
                biblioEntity,
                Biblioteca.class
        );
        Long bibliotecaId = biblioResponse.getBody().getId();

        // Subir libro con título específico
        LibroDto libroDto = new LibroDto();
        libroDto.setTitulo("Harry Potter");
        libroDto.setAutor("J.K. Rowling");
        libroDto.setIdUsuario(userId);
        libroDto.setIdBiblioteca(bibliotecaId);

        HttpEntity<LibroDto> libroEntity = new HttpEntity<>(libroDto, headers);
        restTemplate.postForEntity("/api/libros/subir", libroEntity, Libro.class);

        // Buscar por título
        ResponseEntity<Libro[]> searchResponse = restTemplate.getForEntity(
                "/api/libros/buscar?titulo=Harry",
                Libro[].class
        );

        assertTrue(searchResponse.getBody().length >= 1);
        assertEquals("Harry Potter", searchResponse.getBody()[0].getTitulo());
    }
}
