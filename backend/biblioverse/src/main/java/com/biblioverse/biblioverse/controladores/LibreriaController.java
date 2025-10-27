package com.biblioverse.biblioverse.controladores;

import com.biblioverse.biblioverse.Servicios.LibreriaService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/abrirLibreria")
public class LibreriaController {

    private final LibreriaService libreriaService;

    public LibreriaController(LibreriaService libreriaService) {
        this.libreriaService = libreriaService;
    }
    

    @PostMapping("/importar")
    public String importar(@RequestParam String tema, @RequestParam(defaultValue = "10") int limite) {
        libreriaService.importarLibros(tema, limite);
        return "Importados libros del tema: " + tema;
    }
}
