package com.biblioverse.biblioverse;


import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;


@ExtendWith(MockitoExtension.class)
class BibliotecaServiceTest {

    @Mock
    private BibliotecaRepository bibliotecaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private BibliotecaService bibliotecaService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setUsername("geo");
    }

    // ----------------- Test crearBiblioteca -----------------
//    @Test
//    void crearBiblioteca_exitoso() {
//        Biblioteca biblioteca = new Biblioteca();
//        biblioteca.setNombre("Mi Biblioteca");
//        biblioteca.setEsPublica(true);
//        biblioteca.setCreador(usuario);
//        biblioteca.getUsuarios().add(usuario);
//
//        Mockito.when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
//        Mockito.when(bibliotecaRepository.save(Mockito.any(Biblioteca.class))).thenReturn(biblioteca);
//
//        Biblioteca resultado = bibliotecaService.crearBiblioteca("Mi Biblioteca", true, 1L);
//
//        assertNotNull(resultado);
//        assertEquals("Mi Biblioteca", resultado.getNombre());
//        assertTrue(resultado.isEsPublica());
//        assertEquals(usuario, resultado.getCreador());
//        assertTrue(resultado.getUsuarios().contains(usuario));
//    }

    // ----------------- Test listarBibliotecas -----------------
    @Test
    void listarBibliotecas_exitoso() {
        List<Biblioteca> bibliotecas = new ArrayList<>();
        bibliotecas.add(new Biblioteca());
        bibliotecas.add(new Biblioteca());

        Mockito.when(bibliotecaRepository.findAll()).thenReturn(bibliotecas);

        List<Biblioteca> resultado = bibliotecaService.listarBibliotecas();

        assertEquals(2, resultado.size());
    }

    // ----------------- Test buscarBibliotecas -----------------
    @Test
    void buscarBibliotecas_porNombre() {
        List<Biblioteca> bibliotecas = List.of(new Biblioteca(), new Biblioteca());
        Mockito.when(bibliotecaRepository.findByNombreContainingIgnoreCase("Harry")).thenReturn(bibliotecas);

        List<Biblioteca> resultado = bibliotecaService.buscarBibliotecas("Harry", null);

        assertEquals(2, resultado.size());
    }

//    @Test
//    void buscarBibliotecas_porCreador() {
//        List<Biblioteca> bibliotecas = List.of(new Biblioteca());
//        Mockito.when(bibliotecaRepository.findByCreadorUsernameContaining("geo")).thenReturn(bibliotecas);
//
//        List<Biblioteca> resultado = bibliotecaService.buscarBibliotecas(null, "geo");
//
//        assertEquals(1, resultado.size());
//    }
//
//    @Test
//    void buscarBibliotecas_porNombreYCreador() {
//        List<Biblioteca> bibliotecas = List.of(new Biblioteca());
//        Mockito.when(bibliotecaRepository.findByNombreContainingIgnoreCaseAndCreadorUsernameContaining("Harry", "geo"))
//                .thenReturn(bibliotecas);
//
//        List<Biblioteca> resultado = bibliotecaService.buscarBibliotecas("Harry", "geo");
//
//        assertEquals(1, resultado.size());
//    }
}