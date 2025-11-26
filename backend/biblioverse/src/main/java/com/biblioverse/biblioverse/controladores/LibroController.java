package com.biblioverse.biblioverse.controladores;

import com.biblioverse.biblioverse.Dtos.LibroDto;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Servicios.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    @Autowired
    private LibroService libroService;

    @PostMapping("/subir")
    public ResponseEntity<Libro> subirLibro(
            @RequestParam("titulo") String titulo,
            @RequestParam("autor") String autor,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("esPublico") Boolean esPublico,
            @RequestParam(value = "idBiblioteca", required = false) Long idBiblioteca,
            @RequestParam(value = "archivoPdf", required = false) MultipartFile archivoPdf,
            @RequestParam(value = "portada", required = false) MultipartFile portada) {

        Libro libro = libroService.subirLibro(
                titulo, autor, descripcion,
                idUsuario, esPublico, idBiblioteca,
                archivoPdf, portada
        );

        return ResponseEntity.ok(libro);
    }

    @GetMapping("/listar")
    public List<Libro> listarLibros() {
        return libroService.listarLibros();
    }

    /**
     * Endpoint específico para el explorador - solo libros públicos
     */
    @GetMapping("/explorador")
    public List<Libro> listarLibrosExplorador() {
        return libroService.listarLibrosPublicos();
    }

    /**
     * Endpoint para listar libros visibles para un usuario específico
     */
    @GetMapping("/visibles/{idUsuario}")
    public List<Libro> listarLibrosVisibles(@PathVariable Long idUsuario) {
        return libroService.listarLibrosVisiblesPara(idUsuario);
    }

    @GetMapping("/buscar")
    public List<Libro> buscarLibros(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String autor) {
        return libroService.buscarLibros(titulo, autor);
    }
}