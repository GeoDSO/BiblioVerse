package com.biblioverse.biblioverse.controladores;

import com.biblioverse.biblioverse.Dtos.LibroDto;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Servicios.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/libros")
public class LibroController {

    @Autowired
    private LibroService libroService;

    @PostMapping("/subir")
    public ResponseEntity<?> subirLibro(
            @RequestParam("titulo") String titulo,
            @RequestParam("autor") String autor,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("esPublico") Boolean esPublico,
            @RequestParam(value = "idBiblioteca", required = false) Long idBiblioteca,
            @RequestParam(value = "archivoPdf", required = false) MultipartFile archivoPdf,
            @RequestParam(value = "portada", required = false) MultipartFile portada) {

        try {
            Libro libro = libroService.subirLibro(
                    titulo, autor, descripcion,
                    idUsuario, esPublico, idBiblioteca,
                    archivoPdf, portada
            );
            return ResponseEntity.ok(libro);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("tipo", "RuntimeException");
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error inesperado: " + e.getMessage());
            error.put("tipo", e.getClass().getSimpleName());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<?> listarLibros() {
        try {
            return ResponseEntity.ok(libroService.listarLibros());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al listar libros: " + e.getMessage());
        }
    }

    @GetMapping("/explorador")
    public ResponseEntity<?> listarLibrosExplorador() {
        try {
            return ResponseEntity.ok(libroService.listarLibrosPublicos());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al listar libros públicos: " + e.getMessage());
        }
    }

    @GetMapping("/visibles/{idUsuario}")
    public ResponseEntity<?> listarLibrosVisibles(@PathVariable Long idUsuario) {
        try {
            return ResponseEntity.ok(libroService.listarLibrosVisiblesPara(idUsuario));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al listar libros visibles: " + e.getMessage());
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarLibros(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String autor) {
        try {
            return ResponseEntity.ok(libroService.buscarLibros(titulo, autor));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al buscar libros: " + e.getMessage());
        }
    }

    @GetMapping("/mis-libros/{idUsuario}")
    public ResponseEntity<?> obtenerLibrosDeUsuario(@PathVariable Long idUsuario) {
        try {
            return ResponseEntity.ok(libroService.listarLibrosDeUsuario(idUsuario));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al obtener libros del usuario: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerLibro(@PathVariable Long id) {
        try {
            Libro libro = libroService.obtenerLibroPorId(id);
            if (libro == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(libro);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al obtener el libro: " + e.getMessage());
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarLibro(@PathVariable Long id) {
        try {
            libroService.eliminarLibro(id);
            return ResponseEntity.ok("Libro eliminado exitosamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error inesperado al eliminar el libro: " + e.getMessage());
        }
    }

    @DeleteMapping("/eliminar/{idLibro}/usuario/{idUsuario}")
    public ResponseEntity<?> eliminarLibroDeUsuario(
            @PathVariable Long idLibro,
            @PathVariable Long idUsuario) {
        try {
            libroService.eliminarLibroDeUsuario(idLibro, idUsuario);
            return ResponseEntity.ok("Libro eliminado correctamente");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error inesperado: " + e.getMessage());
        }
    }
}