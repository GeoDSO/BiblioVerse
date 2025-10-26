package com.biblioverse.biblioverse.controladores;

import com.biblioverse.biblioverse.Dtos.LoginResponse;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Servicios.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<Usuario> register(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.registrarUsuario(usuario));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestParam String email, @RequestParam String password) {
        Optional<Usuario> usuario = usuarioService.login(email, password);

        if (usuario.isPresent()) {
            LoginResponse response = new LoginResponse(true, "Login exitoso", usuario.get());
            return ResponseEntity.ok(response);
        } else {
            LoginResponse response = new LoginResponse(false, "Credenciales inválidas", null);
            return ResponseEntity.status(401).body(response);
        }
    }

    @PostMapping("/compartir-biblioteca/{bibliotecaId}/{usuarioId}")
    public ResponseEntity<String> compartirBiblioteca(@PathVariable Long bibliotecaId, @PathVariable Long usuarioId) {
        usuarioService.compartirBiblioteca(bibliotecaId, usuarioId);
        return ResponseEntity.ok("Biblioteca compartida correctamente");
    }

    @PostMapping("/compartir-libro/{libroId}/{usuarioId}")
    public ResponseEntity<String> compartirLibro(@PathVariable Long libroId, @PathVariable Long usuarioId) {
        usuarioService.compartirLibro(libroId, usuarioId);
        return ResponseEntity.ok("Libro compartido correctamente");
    }
}
