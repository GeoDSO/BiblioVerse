package com.biblioverse.biblioverse.controladores;

import com.biblioverse.biblioverse.Dtos.LoginRequest;
import com.biblioverse.biblioverse.Dtos.LoginResponse;
import com.biblioverse.biblioverse.Dtos.RegisterRequest;
import com.biblioverse.biblioverse.Entidades.Usuario;
import com.biblioverse.biblioverse.Servicios.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "https://biblioversefront.onrender.com")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<Usuario> register(@RequestBody RegisterRequest request) {
        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setUsername(request.getUsername());
        usuario.setPassword(request.getPassword());

        Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        var usuario = usuarioService.login(request.getEmail(), request.getPassword());

        if (usuario.isPresent()) {
            LoginResponse response = new LoginResponse(true, "Login exitoso", usuario.get());
            return ResponseEntity.ok(response);
        } else {
            LoginResponse response = new LoginResponse(false, "Credenciales inválidas", null);
            return ResponseEntity.status(401).body(response);
        }
    }
}
