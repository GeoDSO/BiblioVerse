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
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/compartir-biblioteca/{bibliotecaId}/{usuarioId}")
    public ResponseEntity<String> compartirBiblioteca(
            @PathVariable Long bibliotecaId,
            @PathVariable Long usuarioId) {
        usuarioService.compartirBiblioteca(bibliotecaId, usuarioId);
        return ResponseEntity.ok("Biblioteca compartida correctamente");
    }

    @PostMapping("/compartir-libro/{libroId}/{usuarioId}")
    public ResponseEntity<String> compartirLibro(
            @PathVariable Long libroId,
            @PathVariable Long usuarioId) {
        usuarioService.compartirLibro(libroId, usuarioId);
        return ResponseEntity.ok("Libro compartido correctamente");
    }

    @PostMapping("/{seguidorId}/seguir-usuario/{seguidoId}")
    public ResponseEntity<String> seguirUsuario(
            @PathVariable Long seguidorId,
            @PathVariable Long seguidoId) {
        try {
            usuarioService.seguirUsuario(seguidorId, seguidoId);
            return ResponseEntity.ok("Usuario seguido exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{seguidorId}/dejar-de-seguir-usuario/{seguidoId}")
    public ResponseEntity<String> dejarDeSeguirUsuario(
            @PathVariable Long seguidorId,
            @PathVariable Long seguidoId) {
        try {
            usuarioService.dejarDeSeguirUsuario(seguidorId, seguidoId);
            return ResponseEntity.ok("Se ha dejado de seguir al usuario");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{usuarioId}/seguir-biblioteca/{bibliotecaId}")
    public ResponseEntity<String> seguirBiblioteca(
            @PathVariable Long usuarioId,
            @PathVariable Long bibliotecaId) {
        try {
            usuarioService.seguirBiblioteca(usuarioId, bibliotecaId);
            return ResponseEntity.ok("Biblioteca seguida exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{usuarioId}/dejar-de-seguir-biblioteca/{bibliotecaId}")
    public ResponseEntity<String> dejarDeSeguirBiblioteca(
            @PathVariable Long usuarioId,
            @PathVariable Long bibliotecaId) {
        try {
            usuarioService.dejarDeSeguirBiblioteca(usuarioId, bibliotecaId);
            return ResponseEntity.ok("Se ha dejado de seguir la biblioteca");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
