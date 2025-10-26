package com.biblioverse.biblioverse.Servicios;

import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Repositorios.UsuarioRepository;
import com.biblioverse.biblioverse.Seguridad.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class Authservice {
    @Autowired private UsuarioRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    public String register(String email, String username, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("El usuario ya existe");
        }

        Usuario user = Usuario.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(password))
                .build();

        userRepository.save(user);
        return jwtUtil.generateToken(user.getEmail());
    }

    public String login(String email, String password) {
        Usuario user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return jwtUtil.generateToken(user.getEmail());
    }
}
