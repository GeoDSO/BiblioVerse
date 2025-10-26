package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

        Biblioteca biblioteca = new Biblioteca();
        biblioteca.setNombre(nombre);
        biblioteca.setEsPublica(esPublica);
        biblioteca.getUsuarios().add(usuario);

        return bibliotecaRepository.save(biblioteca);
    }

    public List<Biblioteca> listarBibliotecas() {
        return bibliotecaRepository.findAll();
    }

}

