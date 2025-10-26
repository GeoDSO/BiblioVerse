package com.biblioverse.biblioverse.controladores;

import com.biblioverse.biblioverse.Dtos.BibliotecaDto;
import com.biblioverse.biblioverse.Entidades.Biblioteca;
import com.biblioverse.biblioverse.Servicios.BibliotecaService;
import org.springframework.beans.factory.annotation.Autowired;
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
                bibliotecaDTO.getEsPublica(),
                bibliotecaDTO.getIdUsuario()
        );
    }

    @GetMapping("/listar")
    public List<Biblioteca> listarBibliotecas() {
        return bibliotecaService.listarBibliotecas();
    }
}
