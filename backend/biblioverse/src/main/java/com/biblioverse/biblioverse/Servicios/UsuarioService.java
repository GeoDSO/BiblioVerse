package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Rol;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BibliotecaRepository bibliotecaRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setRol(Rol.NORMAL);
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> login(String email, String password) {
        Optional<Usuario> user = usuarioRepository.findByEmail(email);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return user;
        }
        return Optional.empty();
    }

    public void compartirBiblioteca(Long idBiblioteca, Long idUsuario) {
        Biblioteca biblioteca = bibliotecaRepository.findById(idBiblioteca)
                .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        biblioteca.getUsuarios().add(usuario);
        bibliotecaRepository.save(biblioteca);
    }

    public void compartirLibro(Long idLibro, Long idUsuario) {
        Libro libro = libroRepository.findById(idLibro)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Biblioteca biblioteca = libro.getBiblioteca();
        biblioteca.getUsuarios().add(usuario);
        bibliotecaRepository.save(biblioteca);
    }
}
