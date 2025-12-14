package com.biblioverse.biblioverse.controladores;

import com.biblioverse.biblioverse.Dtos.BibliotecaDto;
import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Servicios.BibliotecaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bibliotecas")
public class BibliotecaController {

    @Autowired
    private BibliotecaService bibliotecaService;

    @PostMapping("/crear")
    public Biblioteca crearBiblioteca(@RequestBody BibliotecaDto bibliotecaDTO) {
        return bibliotecaService.crearBiblioteca(
                bibliotecaDTO.getNombre(),
                bibliotecaDTO.getDescripcion(),
                bibliotecaDTO.getEsPublica(),
                bibliotecaDTO.getIdUsuario()
        );
    }

    @PostMapping("/{idBiblioteca}/agregar-libro/{idLibro}")
    public ResponseEntity<String> agregarLibro(
            @PathVariable Long idBiblioteca,
            @PathVariable Long idLibro) {
        try {
            bibliotecaService.agregarLibro(idBiblioteca, idLibro);
            return ResponseEntity.ok("Libro agregado exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ← AÑADE ESTE ENDPOINT (eliminar biblioteca)
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarBiblioteca(@PathVariable Long id) {
        try {
            bibliotecaService.eliminarBiblioteca(id);
            return ResponseEntity.ok("Biblioteca eliminada exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/buscar")
    public List<Biblioteca> buscarBibliotecas(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String username) {
        return bibliotecaService.buscarBibliotecas(nombre, username);
    }

    @GetMapping("/listar")
    public List<Biblioteca> listarBibliotecas() {
        return bibliotecaService.listarBibliotecas();
    }

    @DeleteMapping("/{idBiblioteca}/eliminar-libro/{idLibro}")
    public ResponseEntity<String> eliminarLibro(
            @PathVariable Long idBiblioteca,
            @PathVariable Long idLibro) {
        try {
            bibliotecaService.eliminarLibro(idBiblioteca, idLibro);
            return ResponseEntity.ok("Libro eliminado de la biblioteca exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}