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
            @RequestParam(value = "archivoPdf", required = false) MultipartFile archivoPdf,
            @RequestParam(value = "portada", required = false) MultipartFile portada) {

        Libro libro = libroService.subirLibro(
                titulo, autor, descripcion,
                idUsuario,
                archivoPdf, portada
        );

        return ResponseEntity.ok(libro);
    }

    @GetMapping("/listar")
    public List<Libro> listarLibros() {
        return libroService.listarLibros();
    }

    @GetMapping("/buscar")
    public List<Libro> buscarLibros(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String autor) {
        return libroService.buscarLibros(titulo, autor);
    }
}