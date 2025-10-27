package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
public class BibliotecaService {

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Biblioteca crearBiblioteca(String nombre, boolean esPublica, Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Biblioteca biblioteca = Biblioteca.builder()
                .nombre(nombre)
                .esPublica(esPublica)
                .creador(usuario)
                .usuarios(new HashSet<>())
                .libros(new HashSet<>())
                .build();

        return bibliotecaRepository.save(biblioteca);
    }

    public List<Biblioteca> listarBibliotecas() {
        return bibliotecaRepository.findAll();
    }

    public List<Biblioteca> buscarBibliotecas(String nombre, String username) {
        if (nombre != null && username != null) {
            return bibliotecaRepository.findByNombreContainingIgnoreCaseAndCreadorUsernameContaining(nombre, username);
        } else if (nombre != null) {
            return bibliotecaRepository.findByNombreContainingIgnoreCase(nombre);
        } else if (username != null) {
            return bibliotecaRepository.findByCreadorUsernameContaining(username);
        } else {
            return listarBibliotecas();
        }
    }
}

