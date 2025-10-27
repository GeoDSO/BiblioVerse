package com.biblioverse.biblioverse.controladores;

import com.biblioverse.biblioverse.Dtos.LibroDto;
import com.biblioverse.biblioverse.Entidades.Libro;
import com.biblioverse.biblioverse.Servicios.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/libros")
public class LibroController {

    @Autowired
    private LibroService libroService;

    @PostMapping("/subir")
    public Libro subirLibro(@RequestBody LibroDto libroDTO) {
        return libroService.subirLibro(
                libroDTO.getTitulo(),
                libroDTO.getAutor(),
                libroDTO.getIdUsuario(),
                libroDTO.getIdBiblioteca()
        );
    }

    @GetMapping("/buscar")
    public List<Libro> buscarLibros(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String autor) {
        return libroService.buscarLibros(titulo, autor);
    }

    @GetMapping("/listar")
    public List<Libro> listarLibros() {
        return libroService.listarLibros();
    }
}
