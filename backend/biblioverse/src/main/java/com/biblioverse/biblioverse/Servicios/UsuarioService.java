package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Entidades.Rol;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.BibliotecaRepository;
import com.biblioverse.biblioverse.Repositorios.LibroRepository;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import jakarta.transaction.Transactional;
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
        // Encripta la contraseña antes de guardar
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setRol(Rol.NORMAL);
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> login(String email, String password) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);

        if (usuario.isPresent() && passwordEncoder.matches(password, usuario.get().getPassword())) {
            return usuario;
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

    @Transactional
    public void seguirUsuario(Long seguidorId, Long seguidoId) {
        if (seguidorId.equals(seguidoId)) {
            throw new RuntimeException("No puedes seguirte a ti mismo");
        }

        Usuario seguidor = usuarioRepository.findById(seguidorId)
                .orElseThrow(() -> new RuntimeException("Usuario seguidor no encontrado"));

        Usuario seguido = usuarioRepository.findById(seguidoId)
                .orElseThrow(() -> new RuntimeException("Usuario seguido no encontrado"));

        if (seguidor.getSeguidos().contains(seguido)) {
            throw new RuntimeException("Ya estás siguiendo a este usuario");
        }

        seguidor.getSeguidos().add(seguido);
        usuarioRepository.save(seguidor);
    }

    @Transactional
    public void dejarDeSeguirUsuario(Long seguidorId, Long seguidoId) {
        Usuario seguidor = usuarioRepository.findById(seguidorId)
                .orElseThrow(() -> new RuntimeException("Usuario seguidor no encontrado"));

        Usuario seguido = usuarioRepository.findById(seguidoId)
                .orElseThrow(() -> new RuntimeException("Usuario seguido no encontrado"));

        if (!seguidor.getSeguidos().contains(seguido)) {
            throw new RuntimeException("No estás siguiendo a este usuario");
        }

        seguidor.getSeguidos().remove(seguido);
        usuarioRepository.save(seguidor);
    }

    @Transactional
    public void seguirBiblioteca(Long usuarioId, Long bibliotecaId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Biblioteca biblioteca = bibliotecaRepository.findById(bibliotecaId)
                .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));

        if (usuario.getBibliotecasSeguidas().contains(biblioteca)) {
            throw new RuntimeException("Ya estás siguiendo esta biblioteca");
        }

        usuario.getBibliotecasSeguidas().add(biblioteca);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void dejarDeSeguirBiblioteca(Long usuarioId, Long bibliotecaId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Biblioteca biblioteca = bibliotecaRepository.findById(bibliotecaId)
                .orElseThrow(() -> new RuntimeException("Biblioteca no encontrada"));

        if (!usuario.getBibliotecasSeguidas().contains(biblioteca)) {
            throw new RuntimeException("No estás siguiendo esta biblioteca");
        }

        usuario.getBibliotecasSeguidas().remove(biblioteca);
        usuarioRepository.save(usuario);
    }
}