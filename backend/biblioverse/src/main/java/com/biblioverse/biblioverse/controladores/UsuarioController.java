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
}
